import { cn } from "@/lib/utils";

export interface LeftNavProps {
  items: Array<{
    label: string;
  }>;
  selected: string;
}

export function LeftNav(props: LeftNavProps) {
  const { items, selected } = props;

  return (
    <div className="flex flex-col h-full p-4 border-r w-48">
      <div className="flex flex-col h-full">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={cn(
              "flex items-center py-2 px-4 rounded-md",
              selected === item.label
                ? "text-primary bg-gray-100"
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
