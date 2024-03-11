import { Input } from "@/components/ui/input";
import { useState } from "react";

export interface ChatSidebarProps {
  lead: {
    id: string | number;
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  onSave: (lead: {
    id: string | number;
    name: string;
    email: string;
    phone: string;
  }) => void;
}

interface AttributeProps {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  onBlur: () => void;
}

function Attribute(props: AttributeProps) {
  const { label, value, onChange, onBlur: onSave } = props;

  return (
    <div className="flex items-center my-4 gap-2">
      <div className="text-muted-foreground w-16">{label}</div>
      <Input
        value={value ?? ""}
        onChange={(event) => onChange(event.currentTarget.value)}
        onBlur={onSave}
      />
    </div>
  );
}

export function ChatSidebar(props: ChatSidebarProps) {
  const { lead, onSave } = props;

  const [values, setValues] = useState({
    name: lead.name ?? "",
    email: lead.email ?? "",
    phone: lead.phone ?? "",
  });

  const handleSave = () => {
    onSave({ id: lead.id, ...values });
  };

  return (
    <div className="p-4 border-l w-80">
      <div className="text-lg font-semibold mb-4">Details</div>
      <Attribute
        label="Name"
        value={values.name}
        onChange={(value) => setValues({ ...values, name: value })}
        onBlur={handleSave}
      />
      <Attribute
        label="Email"
        value={values.email}
        onChange={(value) => setValues({ ...values, email: value })}
        onBlur={handleSave}
      />
      <Attribute
        label="Phone"
        value={values.phone}
        onChange={(value) => setValues({ ...values, phone: value })}
        onBlur={handleSave}
      />
    </div>
  );
}
