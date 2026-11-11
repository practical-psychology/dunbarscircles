import PageLayout from "../components/PageLayout";

const REPO = "https://github.com/practical-psychology/dunbarscircles";

export default function AboutPage() {
  return (
    <PageLayout
      title="About & Contact"
      description="Who runs Dunbar's Circles, how to reach us, and how corrections work"
    >
      <div className="mx-auto max-w-3xl space-y-6 text-gray-800 dark:text-gray-100">
        <section aria-labelledby="a-what" className="space-y-2">
          <h2 id="a-what" className="text-xl font-semibold">
            What this site is
          </h2>
          <p>
            Dunbar&apos;s Circles is a free, independent tool that helps you map
            your own relationships onto the layers described in Robin
            Dunbar&apos;s research. It is an educational visualization, not a
            psychological test or clinical advice. It is not affiliated with or
            endorsed by Robin Dunbar or the University of Oxford.
          </p>
        </section>

        <section aria-labelledby="a-owner" className="space-y-2">
          <h2 id="a-owner" className="text-xl font-semibold">
            Ownership
          </h2>
          <p>
            Maintained by the{" "}
            <a className="underline" href={REPO}>
              practical-psychology
            </a>{" "}
            project. The source code is public on GitHub.
          </p>
        </section>

        <section aria-labelledby="a-contact" className="space-y-2">
          <h2 id="a-contact" className="text-xl font-semibold">
            Contact and support
          </h2>
          <p>
            Report bugs, ask questions or request deletion of your cloud backup
            through{" "}
            <a className="underline" href={`${REPO}/issues`}>
              GitHub Issues
            </a>
            . Do not post personal contact data there; say that you want a
            private reply and we will arrange one.
          </p>
        </section>

        <section aria-labelledby="a-corr" className="space-y-2">
          <h2 id="a-corr" className="text-xl font-semibold">
            Corrections policy
          </h2>
          <p>
            Factual and scientific errors are corrected as soon as they are
            verified, and each material correction is recorded in the{" "}
            <a className="underline" href={`${REPO}/commits/main`}>
              public change history
            </a>
            . Send corrections with a source through GitHub Issues.
          </p>
        </section>

        <section aria-labelledby="a-lic" className="space-y-2">
          <h2 id="a-lic" className="text-xl font-semibold">
            License and credits
          </h2>
          <p>
            The site code is open source under the{" "}
            <a className="underline" href={`${REPO}/blob/main/LICENSE`}>
              MIT License
            </a>
            . The research belongs to Robin Dunbar and colleagues; see{" "}
            <a className="underline" href="/evidence">
              Evidence &amp; Limitations
            </a>{" "}
            for references. Facebook and LinkedIn are trademarks of their owners
            and are named only to describe import formats.
          </p>
        </section>
      </div>
    </PageLayout>
  );
}
