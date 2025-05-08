import Link from "next/link";

export const HeaderMobile = () => {
  return (
    <nav className="md:hidden absolute top-12 left-0 right-0 pb-4 flex flex-col gap-3 mt-4">
      {["Dashboard", "Reportes", "Alertas", "Configuración"].map((item) => (
        <Link
          key={item}
          href="#"
          className="font-satoshi-medium px-4 py-2 hover:bg-[hsl(220,15%,20%)] rounded-lg"
        >
          {item}
        </Link>
      ))}
    </nav>
  );
};
