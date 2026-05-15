export type HttpRequest<Body = unknown> = {
  body: Body
}

export type HttpResponse<Body = unknown> = {
  statusCode: number
  body: Body
}
