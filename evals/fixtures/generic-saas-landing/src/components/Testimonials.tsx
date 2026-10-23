export default function Testimonials() {
  const items = [{ quote: "TidyLedger revolutionized our workflow!", name: "Jane Doe", role: "CFO, Acme Inc", avatar: "https://i.pravatar.cc/100?img=3" }];
  return (<section className="p-16">{items.map((t) => (<figure key={t.name} className="rounded-2xl p-8"><img src={t.avatar} className="rounded-full" /><blockquote>{t.quote}</blockquote><figcaption>{t.name}, {t.role} ★★★★★</figcaption></figure>))}</section>);
}
