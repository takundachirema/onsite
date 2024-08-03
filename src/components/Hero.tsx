import { SignedOut, SignUpButton } from "@clerk/nextjs";
import { Button, Link } from "@nextui-org/react";
const Hero = () => {
  return (
    <>
      <section
        id="home"
        className="relative z-10 overflow-hidden pb-16 pt-[120px] md:pb-[120px] md:pt-[150px] xl:pb-[160px] xl:pt-[180px] 2xl:pb-[200px] 2xl:pt-[210px]"
      >
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="mx-auto max-w-[800px] text-center">
                <h1 className="mb-5 text-3xl font-bold leading-tight text-black dark:text-white sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
                  Free and Open-Source Next.js Template for Startup & SaaS
                </h1>
                <p className="text-body-color dark:text-body-color-dark mb-12 text-base !leading-relaxed sm:text-lg md:text-xl">
                  Startup is free Next.js template for startups and SaaS
                  business websites comes with all the essential pages,
                  components, and sections you need to launch a complete
                  business website, built-with Next 13.x and Tailwind CSS.
                </p>
                <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                  <Button
                    as={Link}
                    href="/sign-in"
                    className="rounded-sm px-8 py-4 text-base font-semibold"
                    size="lg"
                    color="primary"
                  >
                    Sign In
                  </Button>
                  <Button
                    className="rounded-sm px-8 py-4 text-base font-semibold"
                    size="lg"
                    color="default"
                  >
                    <Link
                      href="https://github.com/NextJSTemplates/startup-nextjs"
                      className="text-base font-semibold text-white"
                    >
                      Learn More
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
