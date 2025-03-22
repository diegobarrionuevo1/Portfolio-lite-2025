import BlurFade from "./magicui/blur-fade";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { DATA } from "@/data/resume";

const BLUR_FADE_DELAY = 0.04;
export const Hero = () => {
  return (
    <section className="relative   sm:h-screen overflow-hidden sm:pt-0  sm:flex sm:flex-col sm:justify-center ">
      <div className="flex flex-row sm:justify-center sm:items-center md:gap-x-4 ">

        <header className=" sm:w-5/6 sm:mt-0  ">
          <div className="w-4/6 mt-5">
            <h1 className=" text-3xl font-bold sm:text-5xl  text-dark-700 dark:text-dark-200">
              Hola,{" "}
              <span className=" text-primary-600 dark:text-primary-400">
                soy {DATA.name}
              </span>
            </h1>
            <span className=" font-semibold inline-flex animate-background-shine bg-[linear-gradient(110deg,#64748b,45%,#0f172a,55%,#64748b)] dark:bg-[linear-gradient(110deg,#b6eaff,45%,#065074,55%,#b6eaff)] bg-[length:250%_100%] bg-clip-text text-xl text-transparent">
              Desarrollador Web Fullstack
            </span>
          </div>
          <h2 className="max-w-xs sm:max-w-none sm:text-xl mt-6 md:mt-10 text-dark-700 dark:text-dark-200 text-pretty">
            {DATA.pitch}
          </h2>
        </header>
        <div className=" absolute top-7 w-2/6 right-0 max-h-[152px] max-w-[119px] sm:max-h-none sm:max-w-none   sm:static  sm:flex  sm:justify-center sm:items-center ">
          <BlurFade delay={BLUR_FADE_DELAY}>
            <Avatar className="">
              <AvatarImage
                alt={DATA.name}
                src={DATA.avatarUrl}
                width={300}
                height={300}
                className="drop-shadow-sm rounded-full max-h-[160px] sm:max-h-none object-contain shadow-lg dark:shadow-dark-900"
                loading="lazy"
              />
            </Avatar>
          </BlurFade>
        </div>
      </div>

      <div className="absolute hidden md:flex bottom-40 w-full justify-center">
        < a
          href="#work"
          className="md:flex gap-2 animate-bounce text-primary-500 dark:text-primary-400 font-bold"
        >
          Experiencia{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75"
            />
          </svg>
        </a>
      </div>
    </section>
  );
};
