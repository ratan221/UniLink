export const registerSingle = async (model, data) => {
  return await model.create(data);
};

export const readSingle = async (model, data) => {
  return await model.findOne(data);
};

export const countRead = async (model) => {
  return await model.countDocuments();
};

export const MultipleReadWithPagination = async (
  model,
  data,
  limit = 8,
  page = 1
) => {
  return await model
    .find(data)
    .limit(limit)
    .skip((page - 1) * limit);
};

export const readMultiple = async (model, data) => {
  return await model.find(data);
};

export const updateSingle = async (model, filter, data) => {
  // data.updatedAt = Date.now();
  return await model.updateOne(filter, data);
};
export const updateMultiple = async (model, filter, data) => {
  // data.updatedAt = Date.now();
  return await model.updateMany(filter, data);
};

export const deleteSingle = async (model, data) => {
  return await model.deleteOne(data);
};
