import PageLayout from "../components/PageLayout";

export default function EvidencePage() {
  return (
    <PageLayout
      title="Evidence & Limitations"
      description="What the research supports, where it is contested, and how to read the numbers"
    >
      <div className="mx-auto max-w-3xl space-y-6 text-gray-800 dark:text-gray-100">
        <section aria-labelledby="e-nums" className="space-y-2">
          <h2 id="e-nums" className="text-xl font-semibold">
            How to read 5, 15, 50, 150 and 500
          </h2>
          <p>
            These figures are averages from studies of personal networks, not
            fixed limits. Each layer includes the ones inside it: the 15
            contains the 5, the 50 contains the 15, and so on. Individuals vary
            widely with age, personality, culture and life circumstances, and
            the layers are best read as a rough scaling pattern, with each ring
            roughly three times the size of the one inside it.
          </p>
        </section>

        <section aria-labelledby="e-support" className="space-y-2">
          <h2 id="e-support" className="text-xl font-semibold">
            What supports the idea
          </h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              Dunbar (1992) linked neocortex size to typical group size across
              primates and extrapolated a figure near 150 for humans.
            </li>
            <li>
              Hill and Dunbar (2003) found an average personal network of about
              150 in an exchange-of-greetings-cards study.
            </li>
            <li>
              Zhou and colleagues (2005) reported a layered structure in several
              data sets, with a scaling ratio near three.
            </li>
          </ul>
        </section>

        <section aria-labelledby="e-crit" className="space-y-2">
          <h2 id="e-crit" className="text-xl font-semibold">
            Where it is contested
          </h2>
          <p>
            Lindenfors, Wartel and Lind (2021) re-analysed the primate data with
            methods that account for evolutionary relatedness and reported that
            the statistical uncertainty around a human group size is far too
            wide to single out 150. Other researchers note that group size also
            depends on ecology, culture and technology, and that online contact
            counts do not equal close relationships. Dunbar and colleagues
            continue to defend the layered pattern, so treat the numbers as a
            useful model rather than settled law.
          </p>
        </section>

        <section aria-labelledby="e-use" className="space-y-2">
          <h2 id="e-use" className="text-xl font-semibold">
            What this tool does and does not do
          </h2>
          <p>
            It helps you reflect on where your time and attention go. It does
            not diagnose, score your social health, or tell you how many friends
            you should have.
          </p>
        </section>

        <section aria-labelledby="e-refs" className="space-y-2">
          <h2 id="e-refs" className="text-xl font-semibold">
            References
          </h2>
          <ol className="list-decimal space-y-1 pl-6 text-sm">
            <li>
              Dunbar, R. I. M. (1992). Neocortex size as a constraint on group
              size in primates. Journal of Human Evolution, 22(6), 469-493.
            </li>
            <li>
              Hill, R. A., &amp; Dunbar, R. I. M. (2003). Social network size in
              humans. Human Nature, 14(1), 53-72.
            </li>
            <li>
              Zhou, W.-X., Sornette, D., Hill, R. A., &amp; Dunbar, R. I. M.
              (2005). Discrete hierarchical organization of social group sizes.
              Proceedings of the Royal Society B, 272, 439-444.
            </li>
            <li>
              Lindenfors, P., Wartel, A., &amp; Lind, J. (2021).
              &quot;Dunbar&apos;s number&quot; deconstructed. Biology Letters,
              17(5), 20210158.
            </li>
          </ol>
        </section>
      </div>
    </PageLayout>
  );
}
