'use client';
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DebugPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    getDocs(collection(db, 'menuItems')).then((snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);
  return (
    <pre>
      {JSON.stringify(
        items.map((i) => ({ name: i.name, category: i.category })),
        null,
        2
      )}
    </pre>
  );
}
