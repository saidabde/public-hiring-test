import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CarbonEmissionFactorsService } from "../carbonEmissionFactor/carbonEmissionFactors.service";
import { FoodProductCarbonFootprintCreationDto } from "./dto/foodProductCarbonFootprintCreation.dto";
import { FoodProductCarbonFootprint } from "./foodProductCarbonFootprint.entity";

@Injectable()
export class FoodProductCarbonFootprintService {
  constructor(
    @InjectRepository(FoodProductCarbonFootprint)
    private readonly foodProductRepo: Repository<FoodProductCarbonFootprint>,
    private readonly carbonEmissionFactorsService: CarbonEmissionFactorsService
  ) {}

  async findByName(name: string): Promise<FoodProductCarbonFootprint | null> {
    return await this.foodProductRepo.findOne({
      where: { name },
    });
  }

  async create(
    dto: FoodProductCarbonFootprintCreationDto
  ): Promise<FoodProductCarbonFootprint> {
    const carbonFootprint = await this.calculateCarbonFootprint(dto);

    const newProduct = this.foodProductRepo.create({
      name: dto.name,
      carbonFootprintInKgCO2e: carbonFootprint,
    });

    return await this.foodProductRepo.save(newProduct);
  }
  private async calculateCarbonFootprint(
    dto: FoodProductCarbonFootprintCreationDto
  ): Promise<number | null> {
    let totalFootprint = 0;

    for (const ingredient of dto.ingredients) {
      const emissionFactor =
        await this.carbonEmissionFactorsService.findByNameAndUnit(
          ingredient.name,
          ingredient.unit
        );

      if (emissionFactor === null) {
        return null;
      }

      totalFootprint +=
        ingredient.quantity * emissionFactor.emissionCO2eInKgPerUnit;
    }

    return totalFootprint;
  }
}
