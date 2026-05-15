import type { HttpRequest, HttpResponse } from './http.js'

export interface Controller<Body, ResponseBody = unknown> {
  handle(request: HttpRequest<Body>): Promise<HttpResponse<ResponseBody>>
}
