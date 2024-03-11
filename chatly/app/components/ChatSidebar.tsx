import { Input } from "@/components/ui/input";

export interface ChatSidebarProps {
  lead: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
}

interface AttributeProps {
  label: string;
  value: string;
}

function Attribute(props: AttributeProps) {
  const { label, value } = props;

  return (
    <div className="flex items-center my-4 gap-2">
      <div className="text-muted-foreground w-16">{label}</div>
      <Input value={value ?? ""} />
    </div>
  );
}

export function ChatSidebar(props: ChatSidebarProps) {
  const { lead } = props;

  return (
    <div className="p-4 border-l w-80">
      <div className="text-lg font-semibold mb-4">Details</div>
      <Attribute label="Name" value={lead.name} />
      <Attribute label="Email" value={lead.email} />
      <Attribute label="Phone" value={lead.phone} />
    </div>
  );
}
