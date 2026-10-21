import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-[min(720px,calc(100%-32px))] py-14 md:py-[88px]">
      <h1 className="text-[32px] font-semibold tracking-tight">Page not found</h1>
      <p className="mt-4">That path is not part of this site.</p>
      <p className="mt-6">
        <Link className="btn btn-primary" href="/">
          Back to the start
        </Link>
      </p>
    </div>
  );
}
