import { GreenlyDataSource, dataSource } from "../../config/dataSource";
import { FoodProductCarbonFootprint } from "./foodProductCarbonFootprint.entity";

describe("FoodProductCarbonFootprint Entity", () => {
  beforeAll(async () => {
    await dataSource.initialize();
  });

  beforeEach(async () => {
    await GreenlyDataSource.cleanDatabase();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it("should create and save a food product", async () => {
    const foodProduct = new FoodProductCarbonFootprint();
    foodProduct.name = "Chicken";
    foodProduct.carbonFootprintInKgCO2e = 2.4;

    const savedProduct = await dataSource
      .getRepository(FoodProductCarbonFootprint)
      .save(foodProduct);

    expect(savedProduct.id).toBeDefined();
    expect(savedProduct.name).toBe("Chicken");
    expect(savedProduct.carbonFootprintInKgCO2e).toBe(2.4);
  });

  it("should enforce unique constraint on name", async () => {
    const foodProduct1 = new FoodProductCarbonFootprint();
    foodProduct1.name = "Chicken";
    foodProduct1.carbonFootprintInKgCO2e = 2.4;

    await dataSource
      .getRepository(FoodProductCarbonFootprint)
      .save(foodProduct1);

    const foodProduct2 = new FoodProductCarbonFootprint();
    foodProduct2.name = "Chicken";
    foodProduct2.carbonFootprintInKgCO2e = 3.0;

    await expect(
      dataSource.getRepository(FoodProductCarbonFootprint).save(foodProduct2)
    ).rejects.toThrow();
  });

  it("should not allow null name", async () => {
    const foodProduct = new FoodProductCarbonFootprint();
    foodProduct.carbonFootprintInKgCO2e = 2.4;

    await expect(
      dataSource.getRepository(FoodProductCarbonFootprint).save(foodProduct)
    ).rejects.toThrow();
  });

  it("should allow null carbonFootprintInKgCO2e", async () => {
    const foodProduct = new FoodProductCarbonFootprint();
    foodProduct.name = "Beef";
    foodProduct.carbonFootprintInKgCO2e = null;

    const savedProduct = await dataSource
      .getRepository(FoodProductCarbonFootprint)
      .save(foodProduct);

    expect(savedProduct.carbonFootprintInKgCO2e).toBeNull();
  });
});
