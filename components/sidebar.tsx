"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FileTree } from "@/components/file-tree"
import {
  LayoutDashboard,
  Settings,
  ScrollText,
  Menu,
  MessageSquare,
  Database,
  LogOut,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { signOut } from "next-auth/react"

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard
  },
  {
    name: 'Benchmark',
    href: '/benchmark',
    icon: Database
  },
  {
    name: 'Prompts',
    href: '/prompts',
    icon: MessageSquare
  },
  {
    name: 'Logs',
    href: '/logs',
    icon: ScrollText
  },
  {
    name: 'Datasets',
    href: '/datasets',
    icon: Database
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings
  }
]

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  const handleSignOut = () => {
    signOut()
  }

  return (
    <div className={cn("flex h-full flex-col gap-4", className)}>
      <div className="flex flex-col gap-4 px-4 py-3">
        {/* Mobile Menu */}
        <div className="lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {navigation.map((item) => (
                <DropdownMenuItem key={item.name} asChild>
                  <Link href={item.href} className="flex items-center w-full">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex flex-col gap-1">
          <span className="font-semibold px-2 py-1.5">LLM's Evals</span>
          <Separator className="my-2" />
          <nav aria-label="Main navigation" className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname?.startsWith(item.href)

              return (
                <Button
                  key={item.name}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    isActive && "bg-primary/10"
                  )}
                  asChild
                >
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              )
            })}

          </nav>
        </div>
      </div>

      {/* Desktop Sign Out Button */}
      <div className="mt-2 pt-4">
        <Separator className="my-2" />
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>



      {/* File Tree Section */}
      {
        pathname === '/prompts' && (
          <div className="flex-1 overflow-hidden border-t">
            <div className="overflow-auto h-[calc(100%-40px)]">
              <FileTree />
            </div>
          </div>
        )
      }
    </div >
  )
}