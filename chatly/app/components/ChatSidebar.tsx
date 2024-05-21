import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import _ from "lodash";

export interface ChatSidebarProps {
  lead: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    companyId: string | null;
  };
  companies: Array<{ id: number; name: string }>;
  onSave: (lead: {
    id: string;
    name: string;
    email: string;
    phone: string;
    companyId: string | null;
  }) => void;
}

interface AttributeProps {
  label: string;
  type?: "text" | "company";
  value: string | null;
  companies?: Array<{ id: number; name: string }>;
  onChange: (value: string | null) => void;
  onBlur: () => void;
}

function Attribute(props: AttributeProps) {
  const {
    label,
    type = "text",
    value,
    companies = [],
    onChange,
    onBlur: onSave,
  } = props;

  useEffect(() => {
    if (type === "company") {
      onSave();
    }
  }, [value]);

  return (
    <div className="flex items-center my-4 gap-2">
      <div className="text-muted-foreground w-24">{label}</div>
      {type === "text" && (
        <Input
          value={value ?? ""}
          onChange={(event) => onChange(event.currentTarget.value)}
          onBlur={onSave}
        />
      )}
      {type === "company" && (
        <Select
          value={value?.toString() ?? undefined}
          onValueChange={(value) => {
            if (value === "none") {
              onChange(null);
            } else {
              onChange(value);
            }
            // onSave();
          }}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select a company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id.toString()}>
                {company.name}
              </SelectItem>
            ))}
            <SelectItem key="none" value="none">
              None
            </SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

export function ChatSidebar(props: ChatSidebarProps) {
  const { lead, onSave } = props;

  const originalValues = {
    name: lead.name ?? "",
    email: lead.email ?? "",
    phone: lead.phone ?? "",
    companyId: lead.companyId ?? null,
  };

  const [values, setValues] = useState(originalValues);

  console.log("values", values);

  const handleSave = () => {
    if (!_.isEqual(values, originalValues)) {
      onSave({ id: lead.id, ...values });
    }
  };

  return (
    <div className="p-4 border-l w-80">
      <div className="text-lg font-semibold mb-4">Details</div>
      <Attribute
        label="Name"
        value={values.name}
        onChange={(value) => setValues({ ...values, name: value ?? "" })}
        onBlur={handleSave}
      />
      <Attribute
        label="Email"
        value={values.email}
        onChange={(value) => setValues({ ...values, email: value ?? "" })}
        onBlur={handleSave}
      />
      <Attribute
        label="Phone"
        value={values.phone}
        onChange={(value) => setValues({ ...values, phone: value ?? "" })}
        onBlur={handleSave}
      />
      <Attribute
        label="Company"
        type="company"
        value={values.companyId}
        companies={props.companies}
        onChange={(value) => setValues({ ...values, companyId: value })}
        onBlur={handleSave}
      />
    </div>
  );
}
