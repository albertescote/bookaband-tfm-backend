import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorMessage =
      exception instanceof HttpException
        ? exception.message
        : "Unknown exception";

    const responseBody = {
      statusCode: httpStatus,
      error: errorMessage,
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      timestamp: new Date().toISOString(),
    } as {
      statusCode: number;
      error: string;
      message?: string | object;
      path: string;
      timestamp: string;
    };
    if (exception instanceof BadRequestException) {
      responseBody.message = (
        exception.getResponse() as { message: string | object }
      ).message;
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
