import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CarbonEmissionFactor } from "./carbonEmissionFactor.entity";
import { CreateCarbonEmissionFactorDto } from "./dto/create-carbonEmissionFactor.dto";

@Injectable()
export class CarbonEmissionFactorsService {
  constructor(
    @InjectRepository(CarbonEmissionFactor)
    private readonly carbonEmissionFactorRepository: Repository<CarbonEmissionFactor>
  ) {}

  findAll(): Promise<CarbonEmissionFactor[]> {
    return this.carbonEmissionFactorRepository.find();
  }

  save(
    carbonEmissionFactor: CreateCarbonEmissionFactorDto[]
  ): Promise<CarbonEmissionFactor[] | null> {
    return this.carbonEmissionFactorRepository.save(carbonEmissionFactor);
  }

  async findByNameAndUnit(
    name: string,
    unit: string
  ): Promise<CarbonEmissionFactor | null> {
    return await this.carbonEmissionFactorRepository.findOne({
      where: { name, unit },
    });
  }
}
