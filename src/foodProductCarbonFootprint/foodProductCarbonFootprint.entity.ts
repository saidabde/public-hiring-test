import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("food_product_carbon_footprints")
export class FoodProductCarbonFootprint extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ type: "float", nullable: true })
  carbonFootprintInKgCO2e: number | null;
}
