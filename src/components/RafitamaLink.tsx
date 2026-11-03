import React from 'react';

interface RafitamaLinkProps {
  children?: React.ReactNode;
  className?: string;
}

export default function RafitamaLink({ children, className = 'link-rafitama' }: RafitamaLinkProps) {
  return (
    <a
      href="https://rafitama.com"
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title="PT. Rafitama Millenial Wahyudi"
    >
      {children || 'PT. Rafitama Millenial Wahyudi'}
    </a>
  );
}

/**
 * Helper function to replace occurrences of 'PT. Rafitama Millenial Wahyudi'
 * inside any string with a clickable link component.
 */
export function withRafitamaLink(text: string): React.ReactNode {
  const target = 'PT. Rafitama Millenial Wahyudi';
  if (!text || !text.includes(target)) return text;

  const parts = text.split(target);
  return parts.reduce((acc: React.ReactNode[], part, idx) => {
    if (idx === 0) return [part];
    return [
      ...acc,
      <RafitamaLink key={`rafitama-${idx}`} />,
      part,
    ];
  }, []);
}
