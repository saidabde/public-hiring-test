import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CarbonEmissionFactorsModule } from "../carbonEmissionFactor/carbonEmissionFactors.module";
import { FoodProductCarbonFootprintController } from "./foodProductCarbonFootprint.controller";
import { FoodProductCarbonFootprint } from "./foodProductCarbonFootprint.entity";
import { FoodProductCarbonFootprintService } from "./foodProductCarbonFootprint.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([FoodProductCarbonFootprint]),
    CarbonEmissionFactorsModule,
  ],
  providers: [FoodProductCarbonFootprintService],
  controllers: [FoodProductCarbonFootprintController],
})
export class FoodProductCarbonFootprintModule {}
