import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { IngredientDto } from "./ingredient.dto";

export class FoodProductCarbonFootprintCreationDto {
  @IsString({ message: "Name must be a string" })
  @IsNotEmpty({
    message: "The 'name' field cannot be empty. Please provide a value.",
  })
  name: string;

  @IsArray({ message: "Ingredients must be provided as an array." })
  @ValidateNested({ each: true, message: "Each ingredient must be valid." })
  @Type(() => IngredientDto)
  ingredients: IngredientDto[];
}
