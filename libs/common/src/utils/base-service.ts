import { QueryOptions } from 'mongoose';
import { PagingInput } from '../inputs/paging.input';

export class BaseService {
  private model;
  private ignorePopulates = [];
  constructor(model) {
    this.model = model;
  }

  public getModel() {
    return this.model;
  }

  public setIgnorePopulates(ignorePopulates = []) {
    this.ignorePopulates = ignorePopulates;
  }

  async createOne(data: any, session = null) {
    const newModel = new this.model(data);
    return await newModel.save({ session });
  }

  async createMany(data: any, session = null) {
    const newModels = await this.model.insertMany(data).session(session);
    return newModels;
  }

  async findById(_id: string, populates?: any, select?: any) {
    return await this.model
      .findById(_id)
      .populate(this.populateBuilder(populates))
      .select(select ?? {});
  }

  async findOne(options: QueryOptions, populates?: any, select?: any) {
    return await this.model
      .findOne(options)
      .populate(this.populateBuilder(populates))
      .select(select ?? {});
  }

  async find(
    options: QueryOptions,
    populates?: any,
    pagingInput?: any,
    select?: any,
  ) {
    let sort = {};
    let score = undefined;
    if (pagingInput?.search) {
      options['$text'] = {
        $search: this.createSearchTerm(pagingInput.search),
        $caseSensitive: false,
        $diacriticSensitive: false,
      };
      // options["$text"] = { $search: pagingInput.search };
      score = { score: { $meta: 'textScore' } };
      sort['score'] = { $meta: 'textScore' };
    }
    if (pagingInput?.sort) {
      try {
        // const inputSort = JSON.parse(pagingInput.sort);
        sort = { ...sort, ...pagingInput.sort };
      } catch (e) {
        throw new Error('INVALID_SORT_TERM');
      }
    } else sort = { ...sort, ...{ created_at: 1 } };
    if (JSON.stringify(sort) == '{}') sort = { created_at: 1 };
    if (pagingInput?.limit) {
      return await this.model
        .find(options, score)
        .populate(this.populateBuilder(populates))
        .select(select ?? {})
        .sort(sort)
        .limit(pagingInput.limit);
    }
    return await this.model
      .find(options, score)
      .populate(this.populateBuilder(populates))
      .select(select ?? {})
      .sort(sort);
  }

  async paging(
    options: QueryOptions,
    populates?: any,
    pagingInput?: PagingInput,
    select?: any,
  ) {
    let limit = 100;
    if (pagingInput.limit && pagingInput.limit < limit)
      limit = parseInt(pagingInput.limit + '');
    let page = 1;
    if (pagingInput.page && pagingInput.page > page)
      page = parseInt(pagingInput.page + '');
    let sort = {};
    let score = undefined;
    if (pagingInput.search) {
      options['$text'] = {
        $search: this.createSearchTerm(pagingInput.search),
        $caseSensitive: false,
        $diacriticSensitive: false,
      };
      score = { score: { $meta: 'textScore' } };
      sort['score'] = { $meta: 'textScore' };
    }
    if (pagingInput.sort) {
      try {
        // const inputSort = JSON.parse(pagingInput.sort);
        sort = { ...sort, ...pagingInput.sort };
      } catch (e) {
        throw new Error('INVALID_SORT_TERM');
      }
    } else sort = { ...sort, ...{ created_at: 1 } };
    if (JSON.stringify(sort) == '{}') sort = { created_at: 1 };
    const total = await this.model.countDocuments(options);
    const data = await this.model
      .find(options, score)
      .populate(this.populateBuilder(populates))
      .select(select ?? {})
      .limit(limit)
      .skip((page - 1) * limit)
      .sort(sort);
    return {
      total,
      data,
    };
  }

  async updateOne(filter: QueryOptions, data: any, session = null) {
    return await this.model.updateOne(filter, data).session(session);
  }

  async updateMany(filter: QueryOptions, data: any, session = null) {
    return await this.model.updateMany(filter, data).session(session);
  }

  async delete(filter: QueryOptions, session = null) {
    return await this.model.deleteMany(filter).session(session);
  }

  async deleteOne(filter: QueryOptions, session = null) {
    return await this.model.deleteOne(filter).session(session);
  }

  async deleteById(_id, session = null) {
    return await this.model.deleteOne({ _id: _id }).session(session);
  }

  public getPurePopulateModels(): any {
    return [];
  }
  public getPopulateModels(): any {
    return [];
  }

  public recursivePopulateBuilder(
    populateModels,
    populateList,
    populate,
    prevPopulate,
  ) {
    let match = {};
    let populateArray;
    if (typeof populate == 'object') {
      const key = Object.keys(populate)[0];
      populateArray = key.split('.');
      match = populate[key];
    } else populateArray = populate.split('.');
    let existedIndex = -1;
    let p0 = populateArray[0];
    while (this.ignorePopulates.includes(prevPopulate + p0)) {
      populateArray.splice(0, 1);
      p0 += '.' + populateArray[0];
    }
    populateList.forEach((oldPopulate, index) => {
      if (oldPopulate.path == p0) {
        existedIndex = index;
        return;
      }
    });
    if (existedIndex === -1) {
      populateList.push({
        path: p0,
        model: populateModels[prevPopulate + p0],
        match: match,
      });
      existedIndex = populateList.length - 1;
    }
    if (populateArray.length > 1) {
      prevPopulate = prevPopulate + p0 + '.';
      populateArray.splice(0, 1);
      if (!populateList[existedIndex].populate)
        populateList[existedIndex].populate = [];
      populateList[existedIndex].populate = this.recursivePopulateBuilder(
        populateModels,
        populateList[existedIndex].populate,
        populateArray.join('.'),
        prevPopulate,
      );
    }
    return populateList;
  }
  public populateBuilder(populates?: any) {
    let populateList = [];
    if (populates) {
      const populateModels = this.getPopulateModels();
      populates.forEach((populate) => {
        populateList = this.recursivePopulateBuilder(
          populateModels,
          populateList,
          populate,
          '',
        ).filter((el) => {
          return !this.ignorePopulates.includes(el);
        });
      });
    }
    return populateList;
  }
  public createEdgeNGrams(str) {
    if (str && str.length > 3) {
      const minGram = 3;
      const maxGram = str.length;

      return str
        .split(' ')
        .reduce((ngrams, token) => {
          if (token.length > minGram) {
            for (let i = minGram; i <= maxGram && i <= token.length; ++i) {
              ngrams = [...ngrams, token.substr(0, i)];
            }
          } else {
            ngrams = [...ngrams, token];
          }
          return ngrams;
        }, [])
        .join(' ');
    }
    return str;
  }
  public createSearchTerm(str) {
    str = str.replace(
      /[, -, \[, \], _, !, :, ', ", ., /, \\, ;, =, +, *, &, ^, %, $, #, @]/gi,
      ' ',
    );
    str = str.split(' ');
    str = str
      .map((s) => {
        // if(s.toLowerCase().indexOf("đ") !== 0) return s + " " + s.replace(/đ/gi, "d");
        // else if(s.toLowerCase().indexOf("d") !== 0) return s + " " + s.replace(/d/gi, "đ");
        return `"${s}"`;
      })
      .join(' ');
    return str;
  }
}
