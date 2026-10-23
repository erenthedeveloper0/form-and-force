export default function Pricing() {
  return (<section className="grid grid-cols-3 gap-6 p-16"><div className="rounded-2xl border p-8">Starter</div><div className="rounded-2xl border p-8">Pro</div><div className="rounded-2xl border p-8" onClick={() => console.log("contact")}>Enterprise</div></section>);
}
