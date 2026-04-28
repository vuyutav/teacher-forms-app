// components/FurinaCard.tsx
// A styled card container used throughout the app.
// Usage: <FurinaCard>your content here</FurinaCard>

interface FurinaCardProps {
  children: React.ReactNode
  className?: string
  // className? means it's optional — the ? makes it optional
}

export default function FurinaCard({ children, className = '' }: FurinaCardProps) {
  return (
    <div className={`furina-card ${className}`}>
      {children}
    </div>
  )
}