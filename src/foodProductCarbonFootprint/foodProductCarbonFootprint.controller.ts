import {
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";
import { FoodProductCarbonFootprintCreationDto } from "./dto/foodProductCarbonFootprintCreation.dto";
import { FoodProductCarbonFootprintService } from "./foodProductCarbonFootprint.service";

@Controller("food-product-carbon-footprint")
export class FoodProductCarbonFootprintController {
  constructor(
    private readonly foodProductService: FoodProductCarbonFootprintService
  ) {}

  @Post()
  async create(@Body() foodProduct: FoodProductCarbonFootprintCreationDto) {
    const productFootPrint = await this.foodProductService.findByName(
      foodProduct.name
    );

    if (productFootPrint) {
      throw new ConflictException(
        `Product with name '${foodProduct.name}' already exists.`
      );
    }

    return await this.foodProductService.create(foodProduct);
  }

  @Get(":name")
  async findByName(@Param("name") name: string) {
    const productFootPrint = await this.foodProductService.findByName(name);

    if (!productFootPrint) {
      throw new NotFoundException(
        `Food product with name '${name}' not found.`
      );
    }
    return productFootPrint;
  }
}
