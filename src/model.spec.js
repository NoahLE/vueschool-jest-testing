import Model from "./model";

function createModel(data = [], options = {}) {
  return new Model({
    ...options,
    data,
  });
}

test("new works", () => {
  expect(createModel()).toBeInstanceOf(Model);
});

test("model structure", () => {
  expect(createModel()).toEqual(
    expect.objectContaining({
      $collection: expect.any(Array),
      $options: expect.objectContaining({
        primaryKey: "id",
      }),
      record: expect.any(Function),
      all: expect.any(Function),
      find: expect.any(Function),
      update: expect.any(Function),
    })
  );
});

describe("customizations", () => {
  test("we can customize the primary key", () => {
    const model = createModel([], {
      primaryKey: "name",
    });
    expect(model.$options.primaryKey).toBe("name");
  });
});

describe("record", () => {
  const heroes = [{ id: 1, name: "Batman" }, { name: "Deadpool" }];

  test("can add data to the collection", () => {
    const model = createModel();
    model.record(heroes);
    expect(model.$collection).toEqual([
      heroes[0],
      {
        id: expect.any(Number),
        name: heroes[1].name,
      },
    ]);
  });

  test("gets called when data is passed to the Model", () => {
    const spy = jest.spyOn(Model.prototype, "record");
    const model = createModel([{ data: heroes }]);

    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });

  describe("all", () => {
    const heroes = [{ name: "Batman" }, { name: "Deadpool" }];
    test("returns empty model", () => {
      const spy = jest.spyOn(Model.prototype, "all");
      const model = createModel();

      expect(model.all()).toEqual([]);
      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });

    test("returns model data", () => {
      const spy = jest.spyOn(Model.prototype, "all");
      const model = createModel(heroes);

      expect(model.all()).toEqual(heroes);
      expect(model.all().length).toEqual(2);
      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });

    test("original data stays intact", () => {
      const heroes = createModel([{ name: "Batman" }]);
      const data = heroes.all();
      data[0].name = "Joker";

      expect(heroes.$collection[0].name).toBe("Batman");
    });
  });

  describe("find", () => {
    const heroes = [
      { id: 1, name: "Batman" },
      { id: 2, name: "Deadpool" },
    ];

    test("returns null if nothing is found", () => {
      const model = createModel(heroes);
      const found = model.find("Joker");
      expect(found).toBeNull();
    });

    test("returns a matching entry", () => {
      const model = createModel(heroes);
      expect(model.find(1)).toEqual(heroes[0]);
    });
  });

  describe("update", () => {
    const heroesAndVillians = [{ id: 1, name: "Batman" }];
    let model;

    beforeEach(() => {
      const dataset = JSON.parse(JSON.stringify(heroesAndVillians));
      model = createModel(dataset);
    });

    test("an entry by id", () => {
      model.update(1, { name: "Joker" });
      expect(model.find(1).name).toBe("Joker");
    });

    test("extend an entry by id", () => {
      model.update(1, { cape: true });
      expect(model.find(1)).toEqual(
        expect.objectContaining({
          name: "Batman",
          cape: true,
        })
      );
    });

    test("return false if not entry matches", () => {
      expect(model.update(5, { name: "Iron Man" })).toBe(false);
    });
  });
});
