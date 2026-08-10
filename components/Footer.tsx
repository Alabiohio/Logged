"use client";

import Link from "next/link";

const links = {
  Product: [
    "Features",
    "Pricing",
    "Documentation",
    "Changelog",
  ],
  Resources: [
    "Blog",
    "Status",
    "API",
    "Support",
  ],
  Company: [
    "About",
    "Privacy",
    "Terms",
    "Contact",
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-glass backdrop-blur-xl">

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 lg:grid-cols-4">

        <div>

          <h2 className="text-3xl font-black">
            Logged
          </h2>

          <p className="mt-5 leading-7 text-text-muted">
            A modern logging platform for developers building reliable software.
          </p>

        </div>

        {Object.entries(links).map(([title, items]) => (
          <div key={title}>

            <h3 className="font-bold">
              {title}
            </h3>

            <div className="mt-5 flex flex-col gap-3">

              {items.map((item) => (
                <Link
                  href="#"
                  key={item}
                  className="text-text-muted transition hover:text-primary-hover"
                >
                  {item}
                </Link>
              ))}

            </div>

          </div>
        ))}

      </div>

      <div className="border-t border-border py-6 text-center text-sm text-text-muted">
        © {new Date().getFullYear()} Logged. All rights reserved.
      </div>

    </footer>
  );
}