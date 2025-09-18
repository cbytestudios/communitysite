"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Trash2, GripVertical, ChevronDown } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface Permission { role: string; canView: boolean; canPost: boolean; canReply: boolean; canModerate: boolean }
interface Category { id?: string; name: string; description?: string; sortOrder: number; permissions: Permission[] }

const DEFAULT_ROLES = ["guest","member","moderator","admin"]

export function ForumManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/forum/categories', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          const cats: Category[] = (data?.categories || []).map((c: any, idx: number) => ({
            id: c.id,
            name: c.name,
            description: c.description || '',
            sortOrder: typeof c.sortOrder === 'number' ? c.sortOrder : (typeof c.order === 'number' ? c.order : idx),
            permissions: (c.permissions || []).length
              ? c.permissions
              : DEFAULT_ROLES.map(r => ({ role: r, canView: true, canPost: r !== 'guest', canReply: r !== 'guest', canModerate: r === 'moderator' || r === 'admin' }))
          }))
          setCategories(cats)
        }
      } catch {}
    })()
  }, [])

  const addCategory = () => {
    const nextOrder = categories.length ? Math.max(...categories.map(c => c.sortOrder)) + 1 : 0
    setCategories([
      ...categories,
      {
        name: "New Category",
        description: "",
        sortOrder: nextOrder,
        permissions: DEFAULT_ROLES.map(r => ({ role: r, canView: true, canPost: r !== 'guest', canReply: r !== 'guest', canModerate: r === 'moderator' || r === 'admin' }))
      }
    ])
  }

  const updatePerm = (idx: number, role: string, key: keyof Permission, value: boolean) => {
    setCategories(prev => prev.map((c, i) => i !== idx ? c : ({
      ...c,
      permissions: c.permissions.map(p => p.role !== role ? p : { ...p, [key]: value })
    })))
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/forum/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories })
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Forum categories saved')
    } catch {
      toast.error('Failed to save forum categories')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="bg-charcoal-light/80 border-amber-gold/20">
      <CardHeader>
        <CardTitle className="text-amber-gold">Forum Management</CardTitle>
        <CardDescription className="text-sage-green/80">Create categories and set role permissions. Changes auto-save.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={addCategory} className="bg-amber-gold text-charcoal hover:bg-amber-gold/90">Add Category</Button>
        </div>
        <Accordion type="multiple" className="rounded-lg border border-amber-gold/20 divide-y divide-amber-gold/10">
          {categories
            .slice()
            .sort((a,b) => a.sortOrder - b.sortOrder)
            .map((cat, idx) => (
              <AccordionItem key={idx} value={`cat-${idx}`} className="bg-charcoal/30">
                <div className="flex items-center justify-between px-4 py-2">
                  <AccordionTrigger className="px-0 py-0">
                    <div className="flex flex-1 items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-sage-green/70" />
                        <span className="text-sage-green font-medium">{cat.name || 'Untitled Category'}</span>
                        <span className="text-xs text-sage-green/60">(Order {cat.sortOrder})</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <Button
                    variant="ghost"
                    onClick={() => setCategories(cs => cs.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </Button>
                </div>
                <AccordionContent className="px-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-sage-green">Name</Label>
                      <Input value={cat.name} onChange={e => setCategories(cs => cs.map((c,i)=> i!==idx?c:{...c, name:e.target.value}))} className="bg-charcoal border-amber-gold/30 text-sage-green" />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sage-green">Description</Label>
                      <Input value={cat.description} onChange={e => setCategories(cs => cs.map((c,i)=> i!==idx?c:{...c, description:e.target.value}))} className="bg-charcoal border-amber-gold/30 text-sage-green" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label className="text-sage-green mb-2 block">Permissions</Label>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sage-green text-sm">
                        <thead>
                          <tr className="text-left">
                            <th className="py-2 pr-4">Role</th>
                            <th className="py-2 pr-4">View</th>
                            <th className="py-2 pr-4">Post</th>
                            <th className="py-2 pr-4">Reply</th>
                            <th className="py-2 pr-4">Moderate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {DEFAULT_ROLES.map(role => {
                            const p = cat.permissions.find(x => x.role === role) || { role, canView: false, canPost: false, canReply: false, canModerate: false }
                            return (
                              <tr key={role} className="border-t border-amber-gold/10">
                                <td className="py-2 pr-4">{role}</td>
                                {(['canView','canPost','canReply','canModerate'] as const).map(key => (
                                  <td key={key} className="py-2 pr-4">
                                    <input type="checkbox" checked={p[key]} onChange={e => updatePerm(idx, role, key, e.target.checked)} className="w-4 h-4 text-amber-gold bg-charcoal border-amber-gold/30 rounded" />
                                  </td>
                                ))}
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
          ))}
        </Accordion>
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} variant="outline" className="border-amber-gold/40 text-amber-gold">
            {saving ? 'Saving…' : 'Save Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}