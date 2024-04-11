import { Link } from "@/components/Link"
import { Tooltip } from "@/components/Tooltip"
import { Plus } from "@phosphor-icons/react/dist/csr/Plus"
import { ArrowSquareOut } from "@phosphor-icons/react/dist/csr/ArrowSquareOut"
import { GithubLogo } from "@phosphor-icons/react/dist/csr/GithubLogo"
import { Flask } from "@phosphor-icons/react/dist/csr/Flask"

export function DemoCards() {
  return (
    <div className="flex flex-wrap gap-2 justify-around items-start mt-8 mb-12 w-full">
      {[
        {
          href: "https://next-auth-example.vercel.app/",
          img: "/img/etc/nextjs.svg",
          name: "Next.js",
          githubHref: "https://github.com/nextauthjs/next-auth-example",
          logoWidth: "40",
          wip: false,
        },
        {
          href: "https://sveltekit-auth-example.vercel.app/",
          img: "/img/etc/sveltekit.svg",
          name: "SvelteKit",
          githubHref: "https://github.com/nextauthjs/sveltekit-auth-example",
          logoWidth: "35",
          wip: true,
        },
        {
          href: "https://authjs-express-dev-app.onrender.com/",
          img: "/img/etc/express.svg",
          name: "Express",
          logoWidth: "40",
          githubHref: "https://github.com/nextauthjs/express-auth-example",
          wip: true,
        },
      ].map(({ href, name, img, logoWidth, wip, githubHref }) => (
        <div className="flex flex-col gap-2 group" key={name}>
          <Link
            href={`/getting-started/installation?framework=${name.toLowerCase()}`}
            className="flex relative flex-col flex-wrap justify-between items-center p-4 w-28 h-28 !no-underline rounded-lg border border-solid shadow-sm transition-colors duration-300 border-neutral-200 dark:border-neutral-800 dark:hover:bg-neutral-950 hover:bg-neutral-50"
          >
            <img
              alt={name}
              src={img}
              width={logoWidth}
              className={
                name === "Express" || name === "Next.js" ? "dark:invert" : ""
              }
            />
            <div className="mt-3 text-sm">{name}</div>
            {wip ? (
              <div
                className="absolute z-10 p-2 text-sm font-semibold text-black bg-amber-300 rounded-full shadow-sm"
                style={{ right: "-20px", top: "-15px" }}
              >
                <Flask size={24} />
              </div>
            ) : null}
          </Link>
          <div className="flex gap-2">
            <Tooltip label="Live Example">
              <a
                href={href}
                rel="noreferrer"
                target="_blank"
                className="flex justify-center p-2 w-full text-sm rounded-md bg-slate-100 dark:bg-neutral-900"
              >
                <ArrowSquareOut size={20} />
              </a>
            </Tooltip>
            <Tooltip label="Github Repository">
              <a
                href={githubHref}
                rel="noreferrer"
                target="_blank"
                className="flex justify-center p-2 w-full text-sm rounded-md bg-slate-100 dark:bg-neutral-900"
              >
                <GithubLogo size={20} />
              </a>
            </Tooltip>
          </div>
        </div>
      ))}
      <Link
        href="/guides/creating-a-framework-integration"
        className="flex relative flex-col flex-wrap justify-between items-center p-4 w-28 h-28 bg-white rounded-lg border border-solid shadow-sm border-slate-200 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <Plus size={36} />
        <div className="mt-3 text-sm">Add New</div>
      </Link>
    </div>
  )
}
