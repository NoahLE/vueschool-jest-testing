export default class Model {
  constructor(data = []) {
    this.$collection = [];
  }

  record(data) {
    this.$collection.push(data);
  }
  all() {}
  update() {}
  find() {}
}
