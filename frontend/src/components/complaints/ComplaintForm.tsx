"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileDropzone } from "@/components/complaints/FileDropzone";
import { LocationPicker } from "@/components/complaints/LocationPicker";
import { complaintsApi, departmentsApi, categoriesApi, uploadApi } from "@/lib/api";
import type { Department, Category } from "@/types";

const complaintSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(30, "Please provide more detail"),
  location: z.string().min(3, "Location is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  departmentId: z.string().min(1, "Please select a department"),
  categoryId: z.string().min(1, "Please select a category"),
});

type ComplaintValues = z.infer<typeof complaintSchema>;

export function ComplaintForm() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ComplaintValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      latitude: undefined,
      longitude: undefined,
      departmentId: "",
      categoryId: "",
    },
  });

  useEffect(() => {
    departmentsApi.getAll()
      .then(setDepartments)
      .catch(() => toast.error("Failed to load departments"))
      .finally(() => setLoadingDepts(false));
  }, []);

  const selectedDepartmentId = watch("departmentId");

  useEffect(() => {
    if (!selectedDepartmentId) { setCategories([]); return; }
    categoriesApi.getAll(selectedDepartmentId)
      .then((cats) => setCategories(cats.filter((c) => c.isActive)))
      .catch(() => toast.error("Failed to load categories"));
  }, [selectedDepartmentId]);

  const latitude = watch("latitude");
  const longitude = watch("longitude");

  async function onSubmit(values: ComplaintValues) {
    setSubmitting(true);
    try {
      // Upload attachments first
      const attachments = await Promise.all(
        files.map((file) => uploadApi.upload(file)),
      );

      const hasPin = Number.isFinite(values.latitude) && Number.isFinite(values.longitude);

      const result = await complaintsApi.create({
        title: values.title,
        description: values.description,
        location: values.location,
        department_id: values.departmentId,
        category_id: values.categoryId,
        latitude: hasPin ? values.latitude : undefined,
        longitude: hasPin ? values.longitude : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      toast.success(`Complaint submitted! Tracking code: ${result.tracking_code}`);
      router.push(`/complaint/${result.id}`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Failed to submit complaint. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-6">
      <p className="text-xs text-gray-500 dark:text-[var(--text-muted)]">
        <span className="font-medium text-red-500 dark:text-[var(--danger)]">*</span> Required field — everything else is
        optional.
      </p>

      <div className="elev-1 bg-white rounded-lg border border-gray-200 dark:border-transparent p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-secondary)]">Issue Details</h2>
        <div className="space-y-1">
          <Label htmlFor="title">
            Title <span className="text-red-500 dark:text-[var(--danger)]">*</span>
          </Label>
          <Input id="title" placeholder="Brief summary of the issue" {...register("title")} />
          {errors.title && <p className="text-xs text-red-500 dark:text-[var(--danger)] dark:flex dark:items-center dark:gap-1">
              <AlertCircle className="hidden h-3.5 w-3.5 shrink-0 dark:block" />
              {errors.title.message}
            </p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="description">
            Description <span className="text-red-500 dark:text-[var(--danger)]">*</span>
          </Label>
          <Textarea
            id="description"
            rows={5}
            placeholder="Describe the issue in detail — what, where, and when"
            {...register("description")}
          />
          {errors.description && <p className="text-xs text-red-500 dark:text-[var(--danger)] dark:flex dark:items-center dark:gap-1">
              <AlertCircle className="hidden h-3.5 w-3.5 shrink-0 dark:block" />
              {errors.description.message}
            </p>}
        </div>
      </div>

      <div className="elev-1 bg-white rounded-lg border border-gray-200 dark:border-transparent p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-secondary)]">Categorization</h2>
        <div className="space-y-1">
          <Label htmlFor="location">
            Location <span className="text-red-500 dark:text-[var(--danger)]">*</span>
          </Label>
          <Input id="location" placeholder="Street address, area or landmark" {...register("location")} />
          {errors.location && <p className="text-xs text-red-500 dark:text-[var(--danger)] dark:flex dark:items-center dark:gap-1">
              <AlertCircle className="hidden h-3.5 w-3.5 shrink-0 dark:block" />
              {errors.location.message}
            </p>}
          <p className="text-xs text-gray-400 dark:text-[var(--text-muted)]">
            Describe the location in words — this is what gets shown to officers. The map pin
            below is a separate, optional add-on and won&apos;t fill this in for you.
          </p>
        </div>
        <LocationPicker
          latitude={latitude}
          longitude={longitude}
          onChange={({ latitude, longitude }) => {
            setValue("latitude", Number.isNaN(latitude) ? undefined : latitude);
            setValue("longitude", Number.isNaN(longitude) ? undefined : longitude);
          }}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="department">
              Department <span className="text-red-500 dark:text-[var(--danger)]">*</span>
            </Label>
            <Controller
              control={control}
              name="departmentId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("categoryId", "");
                  }}
                  disabled={loadingDepts}
                >
                  <SelectTrigger id="department" className="w-full">
                    <SelectValue placeholder={loadingDepts ? "Loading..." : "Select department"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.departmentId && <p className="text-xs text-red-500 dark:text-[var(--danger)] dark:flex dark:items-center dark:gap-1">
              <AlertCircle className="hidden h-3.5 w-3.5 shrink-0 dark:block" />
              {errors.departmentId.message}
            </p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="category">
              Category <span className="text-red-500 dark:text-[var(--danger)]">*</span>
            </Label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!selectedDepartmentId || categories.length === 0}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue
                      placeholder={selectedDepartmentId ? "Select category" : "Select department first"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && <p className="text-xs text-red-500 dark:text-[var(--danger)] dark:flex dark:items-center dark:gap-1">
              <AlertCircle className="hidden h-3.5 w-3.5 shrink-0 dark:block" />
              {errors.categoryId.message}
            </p>}
          </div>
        </div>
      </div>

      <div className="elev-1 bg-white rounded-lg border border-gray-200 dark:border-transparent p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-[var(--text-secondary)]">
          Attachments <span className="text-sm font-normal text-gray-400 dark:text-[var(--text-muted)]">(optional)</span>
        </h2>
        <FileDropzone files={files} onChange={setFiles} maxFiles={3} />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Complaint"
          )}
        </Button>
      </div>
    </form>
  );
}
