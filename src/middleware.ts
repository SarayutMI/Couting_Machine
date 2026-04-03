export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/cameras/:path*", "/counting/:path*", "/counts/:path*", "/settings/:path*"],
};
