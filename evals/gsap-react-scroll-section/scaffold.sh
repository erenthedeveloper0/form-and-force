#!/bin/bash
# SPDX-License-Identifier: MIT
set -euo pipefail
mkdir -p src/components src/app
cat > package.json <<'FF_EOF'
{ "name": "tidyledger", "private": true,
  "dependencies": { "next": "15.1.0", "react": "19.0.0", "react-dom": "19.0.0", "gsap": "3.13.0", "@gsap/react": "2.1.2" },
  "devDependencies": { "typescript": "5.7.2" } }
FF_EOF
cat > src/components/HowItWorks.tsx <<'FF_EOF'
export default function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="how">
      <h2 id="how-title">How reconciliation works</h2>
      {/* TODO: three-step sequence */}
    </section>
  );
}
FF_EOF
cat > src/app/page.tsx <<'FF_EOF'
import HowItWorks from "../components/HowItWorks";
export default function Page() { return <main><h1>TidyLedger</h1><HowItWorks /></main>; }
FF_EOF
