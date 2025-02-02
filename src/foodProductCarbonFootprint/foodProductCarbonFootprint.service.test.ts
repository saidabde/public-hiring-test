import { dataSource, GreenlyDataSource } from "../../config/dataSource";
import { CarbonEmissionFactor } from "../carbonEmissionFactor/carbonEmissionFactor.entity";
import { CarbonEmissionFactorsService } from "../carbonEmissionFactor/carbonEmissionFactors.service";
import { getTestEmissionFactor } from "../seed-dev-data";
import { FoodProductCarbonFootprintCreationDto } from "./dto/foodProductCarbonFootprintCreation.dto";
import { FoodProductCarbonFootprint } from "./foodProductCarbonFootprint.entity";
import { FoodProductCarbonFootprintService } from "./foodProductCarbonFootprint.service";

let flourEmissionFactor = getTestEmissionFactor("flour");
let hamEmissionFactor = getTestEmissionFactor("ham");
let oliveOilEmissionFactor = getTestEmissionFactor("oliveOil");
let foodProductCarbonFootprintService: FoodProductCarbonFootprintService;
let carbonEmissionFactorService: CarbonEmissionFactorsService;

beforeAll(async () => {
  await dataSource.initialize();
  carbonEmissionFactorService = new CarbonEmissionFactorsService(
    dataSource.getRepository(CarbonEmissionFactor)
  );
  foodProductCarbonFootprintService = new FoodProductCarbonFootprintService(
    dataSource.getRepository(FoodProductCarbonFootprint),
    carbonEmissionFactorService
  );
});

beforeEach(async () => {
  await GreenlyDataSource.cleanDatabase();
  await carbonEmissionFactorService.save([
    oliveOilEmissionFactor,
    hamEmissionFactor,
    flourEmissionFactor,
  ]);
});

describe("FoodProductCarbonFootprint.service", () => {
  it("should create and save a food product with correct carbon footprint", async () => {
    const dto: FoodProductCarbonFootprintCreationDto = {
      name: "Pizza",
      ingredients: [
        { name: "flour", unit: "kg", quantity: 0.5 },
        { name: "ham", unit: "kg", quantity: 0.2 },
        { name: "oliveOil", unit: "kg", quantity: 0.1 },
      ],
    };

    const savedProduct = await foodProductCarbonFootprintService.create(dto);

    expect(savedProduct).toBeDefined();
    expect(savedProduct.name).toBe("Pizza");

    const expectedFootprint =
      0.5 * flourEmissionFactor.emissionCO2eInKgPerUnit +
      0.2 * hamEmissionFactor.emissionCO2eInKgPerUnit +
      0.1 * oliveOilEmissionFactor.emissionCO2eInKgPerUnit;

    expect(savedProduct.carbonFootprintInKgCO2e).toBeCloseTo(
      expectedFootprint,
      2
    );
  });

  it("should create and save a food product with null carbon footprint", async () => {
    const dto: FoodProductCarbonFootprintCreationDto = {
      name: "Pizza",
      ingredients: [
        { name: "flour", unit: "kg", quantity: 0.5 },
        { name: "ham", unit: "kg", quantity: 0.2 },
        { name: "oliveOil", unit: "letter", quantity: 0.1 },
      ],
    };

    const savedProduct = await foodProductCarbonFootprintService.create(dto);

    expect(savedProduct).toBeDefined();
    expect(savedProduct.name).toBe("Pizza");
    expect(savedProduct.carbonFootprintInKgCO2e).toBeNull();
  });

  it("should create and save a food product with null carbon footprint", async () => {
    const dto: FoodProductCarbonFootprintCreationDto = {
      name: "Pizza",
      ingredients: [
        { name: "flour", unit: "kg", quantity: 0.5 },
        { name: "ham", unit: "kg", quantity: 0.2 },
        { name: "cheese", unit: "kg", quantity: 0.1 },
      ],
    };

    const savedProduct = await foodProductCarbonFootprintService.create(dto);

    expect(savedProduct).toBeDefined();
    expect(savedProduct.name).toBe("Pizza");
    expect(savedProduct.carbonFootprintInKgCO2e).toBeNull();
  });

  it("should not allow creating a food product with a duplicate name", async () => {
    const dto: FoodProductCarbonFootprintCreationDto = {
      name: "Pizza",
      ingredients: [
        { name: "flour", unit: "kg", quantity: 0.5 },
        { name: "ham", unit: "kg", quantity: 0.2 },
        { name: "oliveOil", unit: "kg", quantity: 0.1 },
      ],
    };

    const firstProduct = await foodProductCarbonFootprintService.create(dto);
    expect(firstProduct).toBeDefined();
    expect(firstProduct.name).toBe("Pizza");

    // Attempt to create a duplicate entry
    expect(foodProductCarbonFootprintService.create(dto)).rejects.toThrow();
  });

  it("should not allow creating a food product with no ingredients", async () => {
    const dto: FoodProductCarbonFootprintCreationDto = {
      name: "Pizza",
      ingredients: [],
    };

    expect(foodProductCarbonFootprintService.create(dto)).rejects.toThrow();
  });

  it("should find a food product by name", async () => {
    const dto: FoodProductCarbonFootprintCreationDto = {
      name: "Pizza",
      ingredients: [
        { name: "flour", unit: "kg", quantity: 0.5 },
        { name: "ham", unit: "kg", quantity: 0.2 },
        { name: "oliveOil", unit: "kg", quantity: 0.1 },
      ],
    };

    await foodProductCarbonFootprintService.create(dto);

    const foundProduct =
      await foodProductCarbonFootprintService.findByName("Pizza");

    expect(foundProduct).toBeDefined();
    expect(foundProduct?.name).toBe("Pizza");
  });

  it("should return null when searching for a non-existent food product", async () => {
    const foundProduct =
      await foodProductCarbonFootprintService.findByName("NonExistentProduct");

    expect(foundProduct).toBeNull();
  });
});

afterAll(async () => {
  await dataSource.destroy();
});
