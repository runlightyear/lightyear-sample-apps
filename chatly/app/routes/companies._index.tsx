import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json, useFetcher, useLoaderData, useSubmit } from "@remix-run/react";
import { prisma } from "~/db.server";
import { requireUser } from "~/session.server";
import { Company } from "@prisma/client";
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

export const meta: MetaFunction = () => {
  return [{ title: "Chatly | Companies" }];
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);

  const companies = await prisma.company.findMany({
    where: { ownerId: user.id, isDeleted: false },
    orderBy: {
      name: "asc",
    },
  });

  return { companies };
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

interface EditableCompany {
  id: number | "new";
  name: string;
  domain: string;
}

interface CreateEditCompanyModalProps {
  company: EditableCompany;
  onClose: () => void;
  onSave: (company: EditableCompany) => void;
}

const CreateEditCompanyModal = (props: CreateEditCompanyModalProps) => {
  const { company, onClose, onSave } = props;

  const [name, setName] = useState(company.name || "");
  const [domain, setDomain] = useState(company.domain || "");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {company.id === "new" ? "Create" : "Edit"} Company
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
            <Label htmlFor="domain" className="text-right">
              Domain
            </Label>
            <Input
              id="domain"
              className="col-span-3"
              value={domain}
              autoComplete={"off"}
              onChange={(event) => setDomain(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={"default"}
            onClick={() => onSave({ id: company.id, name, domain })}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export interface ConfirmDeleteModalProps {
  company: Company;
  onClose: () => void;
  onDelete: (company: Company) => void;
}

const ConfirmDeleteModal = (props: ConfirmDeleteModalProps) => {
  const { company, onClose, onDelete } = props;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Are you sure you want to delete {company.name}?</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => onDelete(company)}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function Index() {
  const { companies } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const [editingCompany, setEditingCompany] = useState<EditableCompany | null>(
    null
  );
  const [confirmDeleteCompany, setConfirmDeleteCompany] =
    useState<Company | null>(null);

  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "domain",
      header: "Domain",
    },
    {
      accessorFn: (company) => {
        const date = new Date(company.updatedAt);
        return date.toLocaleString();
      },
      header: "Last Updated",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const company = row.original;

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
                  setEditingCompany({
                    id: company.id,
                    name: company.name || "",
                    domain: company.domain || "",
                  })
                }
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setConfirmDeleteCompany(company)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleSaveCompany = (company: EditableCompany) => {
    if (company.id === "new") {
      console.log("creating new company", company);
      fetcher.submit(
        { name: company.name, domain: company.domain },
        { method: "POST", action: "/companies" }
      );
    } else {
      console.log("updating company", company);
      fetcher.submit(
        { name: company.name, domain: company.domain },
        { method: "PATCH", action: `/companies/${company.id}` }
      );
    }
    setEditingCompany(null);
  };

  const handleDeleteCompany = (company: Company) => {
    fetcher.submit(
      {},
      { method: "DELETE", action: `/companies/${company.id}` }
    );
    setConfirmDeleteCompany(null);
  };

  return (
    <div className="container mx-auto">
      <div className="py-4">
        <Button
          variant={"outline"}
          onClick={() =>
            setEditingCompany({
              id: "new",
              name: "",
              domain: "",
            })
          }
        >
          Create Company
        </Button>
      </div>
      <DataTable columns={columns} data={companies} />
      {editingCompany && (
        <CreateEditCompanyModal
          company={editingCompany}
          onClose={() => setEditingCompany(null)}
          onSave={(updatedCompany) => {
            handleSaveCompany(updatedCompany);
          }}
        />
      )}
      {confirmDeleteCompany && (
        <ConfirmDeleteModal
          company={confirmDeleteCompany}
          onClose={() => setConfirmDeleteCompany(null)}
          onDelete={(company) => {
            console.log("Deleting company:", company);
            handleDeleteCompany(company);
          }}
        />
      )}
    </div>
  );
}
