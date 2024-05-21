import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, useFetcher, useLoaderData, useSubmit } from "@remix-run/react";
import { prisma } from "~/db.server";
import { requireUser } from "~/session.server";
import { Person } from "@prisma/client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const meta: MetaFunction = () => {
  return [{ title: "Chatly | People" }];
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);

  const people = await prisma.person.findMany({
    where: { ownerId: user.id, isDeleted: false },
    include: { company: true },
    orderBy: {
      name: "asc",
    },
  });

  const companies = await prisma.company.findMany({
    where: { ownerId: user.id, isDeleted: false },
    orderBy: {
      name: "asc",
    },
  });

  return { people, companies };
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

interface EditablePerson {
  id: number | "new";
  name: string;
  email: string;
  phone: string;
  companyId: number | null;
}

interface CreateEditPersonModalProps {
  person: EditablePerson;
  companies: Array<{ id: number; name: string }>;
  onClose: () => void;
  onSave: (person: EditablePerson) => void;
}

const CreateEditPersonModal = (props: CreateEditPersonModalProps) => {
  const { person, companies, onClose, onSave } = props;

  const [name, setName] = useState(person.name || "");
  const [email, setEmail] = useState(person.email || "");
  const [phone, setPhone] = useState(person.phone || "");
  const [companyId, setCompanyId] = useState<string | undefined>(
    person.companyId?.toString() ?? undefined
  );
  const [selectKey, setSelectKey] = useState(new Date().toISOString());

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {person.id === "new" ? "Create" : "Edit"} Person
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              className="col-span-3"
              value={name}
              autoComplete={"off"}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              className="col-span-3"
              value={email}
              autoComplete={"off"}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input
              id="phone"
              className="col-span-3"
              value={phone}
              autoComplete={"off"}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="companyId" className="text-right">
              Company
            </Label>
            <Select
              key={selectKey}
              defaultValue={companyId}
              onValueChange={(value) => {
                if (value === "none") {
                  setSelectKey(new Date().toISOString());
                  setCompanyId("");
                } else {
                  setCompanyId(value);
                }
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
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={"default"}
            onClick={() =>
              onSave({
                id: person.id,
                name,
                email,
                phone,
                companyId: companyId ? parseInt(companyId) : null,
              })
            }
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export interface ConfirmDeleteModalProps {
  person: Person;
  onClose: () => void;
  onDelete: (person: Person) => void;
}

const ConfirmDeleteModal = (props: ConfirmDeleteModalProps) => {
  const { person, onClose, onDelete } = props;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Are you sure you want to delete {person.name}?</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => onDelete(person)}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function Index() {
  const { people, companies } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const [editingPerson, setEditingPerson] = useState<EditablePerson | null>(
    null
  );
  const [confirmDeletePerson, setConfirmDeletePerson] = useState<Person | null>(
    null
  );

  const columns: ColumnDef<Person>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    { accessorKey: "company.name", header: "Company" },
    {
      accessorFn: (person) => {
        const date = new Date(person.updatedAt);
        return date.toLocaleString();
      },
      header: "Last Updated",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const person = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  setEditingPerson({
                    id: person.id,
                    name: person.name || "",
                    email: person.email || "",
                    phone: person.phone || "",
                    companyId: person.companyId || null,
                  })
                }
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setConfirmDeletePerson(person)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleSavePerson = (person: EditablePerson) => {
    if (person.id === "new") {
      console.log("creating new person", person);
      fetcher.submit(
        {
          name: person.name,
          email: person.email,
          phone: person.phone,
          companyId: person.companyId ?? null,
        },
        { method: "POST", action: "/people" }
      );
    } else {
      console.log("updating person", person);
      fetcher.submit(
        {
          name: person.name,
          email: person.email,
          phone: person.phone,
          companyId: person.companyId ?? null,
        },
        { method: "PATCH", action: `/people/${person.id}` }
      );
    }
    setEditingPerson(null);
  };

  const handleDeletePerson = (person: Person) => {
    fetcher.submit({}, { method: "DELETE", action: `/people/${person.id}` });
    setConfirmDeletePerson(null);
  };

  return (
    <div className="container mx-auto">
      <div className="py-4">
        <Button
          variant={"outline"}
          onClick={() =>
            setEditingPerson({
              id: "new",
              name: "",
              email: "",
              phone: "",
              companyId: null,
            })
          }
        >
          Create Person
        </Button>
      </div>
      <DataTable columns={columns} data={people} />
      {editingPerson && (
        <CreateEditPersonModal
          person={editingPerson}
          companies={companies}
          onClose={() => setEditingPerson(null)}
          onSave={(updatedPerson) => {
            handleSavePerson(updatedPerson);
          }}
        />
      )}
      {confirmDeletePerson && (
        <ConfirmDeleteModal
          person={confirmDeletePerson}
          onClose={() => setConfirmDeletePerson(null)}
          onDelete={(person) => {
            console.log("Deleting person:", person);
            handleDeletePerson(person);
          }}
        />
      )}
    </div>
  );
}
