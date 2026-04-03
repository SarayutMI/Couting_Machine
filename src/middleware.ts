export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/cameras/:path*", "/counts/:path*", "/settings/:path*"],
};
