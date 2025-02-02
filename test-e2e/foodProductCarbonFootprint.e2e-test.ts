import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { dataSource, GreenlyDataSource } from "../config/dataSource";
import { AppModule } from "../src/app.module";
import { CarbonEmissionFactor } from "../src/carbonEmissionFactor/carbonEmissionFactor.entity";
import { CarbonEmissionFactorsService } from "../src/carbonEmissionFactor/carbonEmissionFactors.service";
import { FoodProductCarbonFootprintCreationDto } from "../src/foodProductCarbonFootprint/dto/foodProductCarbonFootprintCreation.dto";
import { FoodProductCarbonFootprint } from "../src/foodProductCarbonFootprint/foodProductCarbonFootprint.entity";
import { FoodProductCarbonFootprintService } from "../src/foodProductCarbonFootprint/foodProductCarbonFootprint.service";
import { getTestEmissionFactor } from "../src/seed-dev-data";

let flourEmissionFactor = getTestEmissionFactor("flour");
let hamEmissionFactor = getTestEmissionFactor("ham");
let oliveOilEmissionFactor = getTestEmissionFactor("oliveOil");

beforeAll(async () => {
  await dataSource.initialize();
});

afterAll(async () => {
  await dataSource.destroy();
});

describe("FoodProductCarbonFootprintController", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    await app.init();

    await GreenlyDataSource.cleanDatabase();
    await dataSource
      .getRepository(CarbonEmissionFactor)
      .save([flourEmissionFactor, hamEmissionFactor, oliveOilEmissionFactor]);
  });

  it("POST /food-product-carbon-footprint should create and save a food product with correct carbon footprint", async () => {
    const foodProduct: FoodProductCarbonFootprintCreationDto = {
      name: "Pizza",
      ingredients: [
        { name: "flour", unit: "kg", quantity: 0.5 },
        { name: "ham", unit: "kg", quantity: 0.2 },
        { name: "oliveOil", unit: "kg", quantity: 0.1 },
      ],
    };

    const expectedFootprint =
      0.5 * flourEmissionFactor.emissionCO2eInKgPerUnit +
      0.2 * hamEmissionFactor.emissionCO2eInKgPerUnit +
      0.1 * oliveOilEmissionFactor.emissionCO2eInKgPerUnit;

    const response = await request(app.getHttpServer())
      .post("/food-product-carbon-footprint")
      .send(foodProduct)
      .expect(201);

    expect(response.body.name).toEqual(foodProduct.name);
    expect(response.body.carbonFootprintInKgCO2e).toEqual(expectedFootprint);
  });

  it("POST /food-product-carbon-footprint should create and save a food product with null carbon footprint", async () => {
    const foodProduct: FoodProductCarbonFootprintCreationDto = {
      name: "Pizza",
      ingredients: [
        { name: "flour", unit: "kg", quantity: 0.5 },
        { name: "ham", unit: "kg", quantity: 0.2 },
        { name: "cheese", unit: "kg", quantity: 0.1 },
      ],
    };

    const response = await request(app.getHttpServer())
      .post("/food-product-carbon-footprint")
      .send(foodProduct)
      .expect(201);

    expect(response.body.name).toEqual(foodProduct.name);
    expect(response.body.carbonFootprintInKgCO2e).toBeNull();
  });

  it("POST /food-product-carbon-footprint should return error when name is not provided", async () => {
    const foodProduct = {
      ingredients: [
        { name: "flour", unit: "kg", quantity: 0.5 },
        { name: "ham", unit: "kg", quantity: 0.2 },
      ],
    };

    await request(app.getHttpServer())
      .post("/food-product-carbon-footprint")
      .send(foodProduct)
      .expect(400);
  });

  it("POST /food-product-carbon-footprint should return error when ingredients is not provided", async () => {
    const foodProduct = {
      name: "Pizza",
    };

    await request(app.getHttpServer())
      .post("/food-product-carbon-footprint")
      .send(foodProduct)
      .expect(400);
  });

  it("POST /food-product-carbon-footprint should return error when ingredients is an empty array", async () => {
    const foodProduct = {
      name: "Pizza",
      ingredients: [],
    };

    await request(app.getHttpServer())
      .post("/food-product-carbon-footprint")
      .send(foodProduct)
      .expect(400);
  });

  it("POST /food-product-carbon-footprint should return error when an ingredient is invalid", async () => {
    const foodProduct = {
      name: "Pizza",
      ingredients: [
        { name: "", unit: "kg", quantity: 0.5 },
        { name: "ham", unit: "", quantity: 0.2 },
        { name: "oliveOil", unit: "kg", quantity: -0.1 },
      ],
    };

    await request(app.getHttpServer())
      .post("/food-product-carbon-footprint")
      .send(foodProduct)
      .expect(400);
  });

  it("POST /food-product-carbon-footprint should return 409 if product with the same name exists", async () => {
    const foodProduct: FoodProductCarbonFootprintCreationDto = {
      name: "Pizza",
      ingredients: [
        { name: "flour", unit: "kg", quantity: 0.5 },
        { name: "ham", unit: "kg", quantity: 0.2 },
        { name: "oliveOil", unit: "kg", quantity: 0.1 },
      ],
    };

    await request(app.getHttpServer())
      .post("/food-product-carbon-footprint")
      .send(foodProduct)
      .expect(201);

    await request(app.getHttpServer())
      .post("/food-product-carbon-footprint")
      .send(foodProduct)
      .expect(409);
  });

  it("GET /food-product-carbon-footprint should return 404 if product with the specified name does not exist", async () => {
    const nonExistentProductName = "NonExistentPizza";

    return request(app.getHttpServer())
      .get(`/food-product-carbon-footprint/${nonExistentProductName}`)
      .expect(404);
  });

  it("GET /food-product-carbon-footprint should return 200 and the product details if product exists", async () => {
    const foodProduct: FoodProductCarbonFootprintCreationDto = {
      name: "Pizza",
      ingredients: [
        { name: "flour", unit: "kg", quantity: 0.5 },
        { name: "ham", unit: "kg", quantity: 0.2 },
        { name: "oliveOil", unit: "kg", quantity: 0.1 },
      ],
    };

    // Save the product first
    const foodProductCarbonFootprintService =
      new FoodProductCarbonFootprintService(
        dataSource.getRepository(FoodProductCarbonFootprint),
        new CarbonEmissionFactorsService(
          dataSource.getRepository(CarbonEmissionFactor)
        )
      );

    const savedProduct =
      await foodProductCarbonFootprintService.create(foodProduct);
    const expectedFootprint =
      0.5 * flourEmissionFactor.emissionCO2eInKgPerUnit +
      0.2 * hamEmissionFactor.emissionCO2eInKgPerUnit +
      0.1 * oliveOilEmissionFactor.emissionCO2eInKgPerUnit;

    return request(app.getHttpServer())
      .get(`/food-product-carbon-footprint/${savedProduct.name}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.name).toEqual(savedProduct.name);
        expect(response.body.carbonFootprintInKgCO2e).toEqual(
          expectedFootprint
        );
      });
  });
});
