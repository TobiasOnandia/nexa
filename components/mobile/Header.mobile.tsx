import Link from "next/link";

export const HeaderMobile = () => {
  return (
    <div className="md:hidden pb-4">
      <div className="flex flex-col gap-3 mt-4">
        {["Dashboard", "Reportes", "Alertas", "Configuración"].map((item) => (
          <Link
            key={item}
            href="#"
            className="font-satoshi-medium px-4 py-2 hover:bg-[hsl(220,15%,20%)] rounded-lg"
          >
            {item}
          </Link>
        ))}
      </div>
    </div>
  );
};
