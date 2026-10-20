import { EnglishIcon, SpainIcon } from "@/public/icons/icons"

export type LanguageItemProps = {
  title: string
  description: string
  Icon: React.FC<React.SVGProps<SVGSVGElement>>
}

export const LanguageItems: LanguageItemProps[] = [
  {
    title: 'ES',
    description: 'Español',
    Icon: SpainIcon,
  },
  {
    title: 'EN',
    description: 'English',
    Icon: EnglishIcon,
  },
  
]