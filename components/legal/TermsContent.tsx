import { PRIMARY_EMAIL_DOMAIN } from "@/services/config";

/**
 * The Terms of Use, in one place.
 *
 * Rendered BOTH by the public /terms page and by the in-wizard sheet, so the
 * text someone agrees to during signup is provably the same text published at
 * the URL — not a summary that has quietly drifted from it.
 *
 * The institution is never named: the eligible domain is interpolated from
 * configuration, the same rule the rest of the product's copy follows.
 *
 * ⚠️ Not reviewed by a lawyer. Have a qualified professional check this against
 * the laws that actually apply to you before you launch.
 */

export const TERMS_LAST_UPDATED = "23 August 2026";

export function TermsContent() {
  const domain = PRIMARY_EMAIL_DOMAIN;

  return (
    <div className="space-y-7 text-[15px] leading-relaxed text-ink">
      <p className="text-sm text-subtext">Last updated: {TERMS_LAST_UPDATED}</p>

      <Callout>
        <strong className="font-semibold">The short version.</strong> Campus
        Hearts is an independent app made by students. It is not run by, endorsed
        by, or connected to any college or university. You use it because you
        choose to, entirely at your own risk, and you are responsible for how you
        behave on it and for anyone you decide to meet.
      </Callout>

      <Section n="1" title="Who we are, and who we are not">
        <p>
          Campus Hearts (&quot;the app&quot;, &quot;we&quot;, &quot;us&quot;) is
          an independent, student-built social and dating service.
        </p>
        <p>
          <strong className="font-semibold">
            We are not affiliated with, operated by, sponsored by, endorsed by, or
            in any way officially connected to any college, university, institute
            or educational body
          </strong>
          {domain ? (
            <>
              , including the institution that issues{" "}
              <code className="rounded bg-surface-muted px-1.5 py-0.5 text-sm">
                @{domain}
              </code>{" "}
              email addresses.
            </>
          ) : (
            "."
          )}{" "}
          We use college email addresses only to check that a person is a
          student. That check does not make this an official service of any
          institution, and no institution has reviewed, approved or taken
          responsibility for it.
        </p>
        <p>
          Any institution names, domains or marks that appear are used purely to
          describe eligibility. No claim of association is made or implied.
        </p>
      </Section>

      <Section n="2" title="You are here by choice">
        <p>
          Using Campus Hearts is entirely voluntary. Nobody is required,
          instructed or expected by any college, department, faculty member or
          staff member to sign up. You create an account of your own free will,
          for your own personal reasons.
        </p>
        <p>
          No part of your experience here — matches, messages, confessions, or
          anything else — has any bearing on your academic standing, grades,
          attendance, placements or institutional record. Nothing here is
          reported to, shared with, or visible to any college.
        </p>
      </Section>

      <Section n="3" title="Who can use it">
        <p>To create an account you must:</p>
        <List>
          <li>be at least 18 years old;</li>
          <li>
            control a valid, currently active student email address at an
            eligible domain{domain ? ` (currently @${domain})` : ""};
          </li>
          <li>be creating the account for yourself, as one real person; and</li>
          <li>not be barred from using this kind of service under any law that applies to you.</li>
        </List>
        <p>
          One person, one account. Do not create an account for anyone else, and
          do not let anyone else use yours.
        </p>
      </Section>

      <Section n="4" title="How you behave here">
        <p>You agree not to:</p>
        <List>
          <li>harass, threaten, stalk, intimidate or abuse anyone;</li>
          <li>impersonate another person, or misrepresent who you are;</li>
          <li>
            post or send anything sexually explicit involving minors, anything
            illegal, or anything that promotes violence or hatred;
          </li>
          <li>
            share someone else&apos;s photos, messages, contact details or
            private information without their consent — including screenshots of
            conversations from this app;
          </li>
          <li>use the app for advertising, solicitation, scams or spam;</li>
          <li>
            attempt to unmask an anonymous user through technical means, or work
            around any privacy or safety feature; or
          </li>
          <li>scrape, automate, reverse-engineer or attack the service.</li>
        </List>
        <p>
          We can suspend or remove any account, at any time, for any of the
          above — or for anything else we reasonably judge to be harmful to other
          people using the app.
        </p>
      </Section>

      <Section n="5" title="What you post">
        <p>
          You keep ownership of your photos, bio, messages and everything else
          you put on the app. By posting it, you give us permission to store and
          display it as needed to run the service — nothing more. We do not sell
          your content and we do not use it for advertising.
        </p>
        <p>
          You are responsible for what you post. Only upload photos you have the
          right to use, and only share what you are comfortable other students
          seeing.
        </p>
      </Section>

      <Section n="6" title="Meeting people — read this one">
        <p>
          We verify that an account holder has a working student email address.
          That is the only check we perform.{" "}
          <strong className="font-semibold">
            We do not run background checks, identity checks, or criminal record
            checks on anyone.
          </strong>{" "}
          A verified email tells you someone is probably a student. It tells you
          nothing about whether they are safe, honest, or who their photos show.
        </p>
        <p>
          You are entirely responsible for your own decisions about who you talk
          to and who you meet. If you choose to meet someone in person, you do so
          at your own risk. Sensible precautions: meet somewhere public, tell a
          friend where you are going and who with, arrange your own transport,
          and leave whenever you want to.
        </p>
        <p>
          If someone makes you uncomfortable, stop talking to them and report
          them. If you are in danger, contact your local emergency services —
          not us.
        </p>
      </Section>

      <Section n="7" title="Anonymous features">
        <p>
          Confessions and random chat can be used without showing your name. We
          build these features to hide your identity from the other user, and we
          take that seriously.
        </p>
        <p>
          But anonymity is never absolute. What you write can identify you, the
          other person may recognise you, and no software is free of bugs. Do not
          rely on an anonymity feature to say something you could not live with
          being traced back to you.
        </p>
        <p>
          Choosing to reveal yourself is permanent. Once you drop anonymity in a
          conversation, it cannot be restored.
        </p>
      </Section>

      <Section n="8" title="Premium and payments">
        <p>
          Premium is an optional paid upgrade. Payments are processed by a
          third-party payment provider — we never see or store your card
          details. Prices are shown before you pay.
        </p>
        <p>
          Premium is granted only after your payment is confirmed. Unless the law
          where you live says otherwise, payments are non-refundable, and closing
          your account does not refund unused time. Features included in Premium
          may change as the app develops.
        </p>
      </Section>

      <Section n="9" title="Your data">
        <p>
          We collect what the app needs to work: your email address, the profile
          details you enter, your photos, and records of your activity such as
          swipes, matches, messages and profile views. Your email address is used
          to verify you and to sign you in — it is never shown to other users.
        </p>
        <p>
          Deactivating your account hides your profile and keeps your data so you
          can come back. If you want your data permanently deleted, ask us and we
          will delete it.
        </p>
        <p>
          We do not sell your personal data. We may share it where the law
          requires us to, or where it is genuinely necessary to protect someone
          from harm.
        </p>
      </Section>

      <Section n="10" title="No guarantees">
        <p>
          The app is provided &quot;as is&quot; and &quot;as available&quot;. It
          is built and run by students in their own time. We do not promise that
          it will always work, that it will be free of bugs or downtime, that
          your data will never be lost, or that you will meet anyone.
        </p>
        <p>
          We may change, suspend or shut down the service, in whole or in part,
          at any time.
        </p>
      </Section>

      <Section n="11" title="Limits on liability">
        <p>
          To the fullest extent the law allows, the people who build and run
          Campus Hearts are not liable for any loss, injury, distress or damage
          arising from your use of the app — including anything said or done by
          another user, whether online or in person.
        </p>
        <p>
          You use this service at your own risk and on your own initiative. You
          agree not to hold its creators responsible for the conduct of other
          users or for the outcome of any interaction that begins here.
        </p>
        <p>
          Nothing in these terms limits liability that cannot lawfully be
          limited.
        </p>
      </Section>

      <Section n="12" title="Ending your account">
        <p>
          You can deactivate your account at any time from Settings. We can
          suspend or terminate an account that breaks these terms or puts other
          users at risk. The sections about content, liability and conduct
          continue to apply after an account ends.
        </p>
      </Section>

      <Section n="13" title="Changes">
        <p>
          We may update these terms as the app changes. When we do, we will
          update the date at the top. Continuing to use the app after a change
          means you accept the updated terms.
        </p>
      </Section>

      <Section n="14" title="Contact">
        <p>
          Questions, complaints, safety concerns or data requests: get in touch
          from your student email address and we will respond.
        </p>
      </Section>
    </div>
  );
}

function Section({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-bold text-ink">
        <span className="mr-2 text-primary-ink">{n}.</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function List({ children }: { children: React.ReactNode }) {
  return <ul className="ml-5 list-disc space-y-1.5 marker:text-accent">{children}</ul>;
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-border bg-surface p-5">{children}</div>
  );
}
