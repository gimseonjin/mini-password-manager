import { Controller, Get } from '@nestjs/common';

@Controller()
export class ApiController {
  constructor() {}

  @Get()
  getHello(): string {
    return "Hello World!";
  }
}
