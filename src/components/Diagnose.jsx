import React from 'react';

const Diagnose = () => {
  return (
    <div className="container mx-auto px-4 pt-16">
      <h1 className="text-4xl font-bold mb-6">Diagnosing Your Roof</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Signs to Look For</h2>
        <p className="text-lg mb-4">
          Your roof is one of the most important parts of your home. It keeps
          the elements out, provides insulation, and protects your home from
          damage. But like all parts of your home, it needs regular maintenance
          and can wear out over time. Here are some key things to look for when
          diagnosing potential issues with your roof.
        </p>
        <ul className="list-disc list-inside">
          <li>Missing or damaged shingles</li>
          <li>Water stains on ceilings or walls</li>
          <li>Mold or mildew buildup</li>
          <li>Excessive granules in gutters</li>
          <li>Sagging roof areas</li>
          <li>Leaks after rain</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Common Roof Problems</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-2">Leaks</h3>
            <p>
              Leaks are one of the most obvious signs that your roof needs
              attention. Check your attic or ceilings for any signs of water
              damage.
            </p>
          </div>

          <div className="p-4 border rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-2">Shingle Damage</h3>
            <p>
              Missing, curled, or cracked shingles can expose your roof to
              water infiltration and further damage.
            </p>
          </div>

          <div className="p-4 border rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-2">Mold and Mildew</h3>
            <p>
              Mold and mildew growth on your roof may indicate poor ventilation
              or moisture buildup.
            </p>
          </div>

          <div className="p-4 border rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-2">Clogged Gutters</h3>
            <p>
              Debris-filled gutters can prevent proper water drainage and lead
              to roof damage over time.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">When to Call a Professional</h2>
        <p className="text-lg mb-4">
          While it's possible to spot some roof problems on your own, it's
          important to know when to call in a professional. If you're unsure of
          the extent of the damage or how to fix it, a professional roofer can
          assess the situation and provide expert advice.
        </p>
        <ul className="list-disc list-inside">
          <li>Extensive shingle damage or missing shingles</li>
          <li>Multiple leaks or widespread water damage</li>
          <li>Visible sagging or structural damage</li>
          <li>Signs of rot or mold</li>
        </ul>
      </section>

      <footer className="text-center mt-8">
        <p className="text-sm text-gray-600">
          © 2024 Castle Roofing. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Diagnose;
