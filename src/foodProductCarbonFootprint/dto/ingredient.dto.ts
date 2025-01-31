import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class IngredientDto {
  @IsString({ message: "Name must be a string" })
  @IsNotEmpty({
    message: "The 'name' field cannot be empty. Please provide a value.",
  })
  name: string;

  @IsNumber({}, { message: "Quantity must be a number." })
  @Min(0, { message: "Quantity must be greater than or equal to 0." })
  quantity: number;

  @IsString({ message: "Unit must be a string." })
  @IsNotEmpty({
    message: "The 'unit' field cannot be empty. Please provide a value.",
  })
  unit: string;
}
