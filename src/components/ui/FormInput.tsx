import { Input } from "@/components/ui/Input"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/Textarea"
import { Dropdown } from "@/components/ui/Dropdown"
import { MultiDropdown } from "@/components/ui/MultiDropdown"
import { DatePicker } from "@/components/ui/DatePicker"
import { TimePicker } from "@/components/ui/TimePicker"
import { ChevronDown, SquarePlus, Link, CalendarDaysIcon, Clock} from "lucide-react"
import type { ComponentProps, HTMLInputTypeAttribute } from "react"
import { forwardRef } from "react"

const iconVariants = {
    type: ChevronDown,
    category: SquarePlus,
    link: Link,
    date: CalendarDaysIcon,
    time: Clock
}

type iconType = keyof typeof iconVariants;

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement>{
    icon ?: iconType,
    label ?: string,
    placeholder ?: string,
    isTextArea ?: boolean,
    isDate ?: boolean,
    isTime ?: boolean,
    isDropdown ?: boolean,
    isMultiDropdown ?: boolean,
    typeList ?: string[],
    categoryList ?: string[],
    onTextChange?: (value: string) => void,
    onDropdownChange?: (value: string) => void,
    onMultiDropdownChange?: (value: string[]) => void,
    dropdownValue?: string,
    multiValue?: string[],
    /** Sync with react-hook-form `watch("date")` */
    dateValue?: Date,
    onDateChange?: (date: Date) => void,
    onTimeChange?: (time: Date) => void,
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>((
    {className, 
        icon, 
        isTextArea = false, 
        isDate = false,
        isTime = false, 
        isDropdown = false, 
        isMultiDropdown = false, 
        typeList = [], 
        categoryList = [], 
        label, 
        placeholder, 
        type,
        onTextChange,
        onDropdownChange,
        onMultiDropdownChange,
        dropdownValue,
        multiValue,
        dateValue,
        onDateChange,
        onTimeChange,
        ...props}, ref) => {
    const IconComponent = icon ? iconVariants[icon] : null;
    const inputType: HTMLInputTypeAttribute | undefined = icon == "date" ? "date" : (icon == "time" ? "time" : type);
    return (
        <div className="flex flex-col gap-2.5">
            {label && (
                <label className="text-black sm:text-base text-sm font-semibold">
                    {label}
                </label>
            )}
            <div className="relative w-full">
                {IconComponent && !isMultiDropdown && (
                    <div className={cn("absolute top-3 right-4 w-5 h-5 sm:w-6 sm:h-6 pointer-events-none",(label == null) && "sm:mt-8.5")}>
                        <IconComponent color="#949494" className="w-5 h-5 sm:w-6 sm:h-6"/>
                    </div>
                )}
                {isTextArea && (
                    <Textarea
                        placeholder={placeholder}
                        className={cn(
                            "relative h-12 text-black border-[#D6D6D6] hover:border-primary/70 focus-visible:ring-0 resize-none",
                            "pt-3 pb-3 px-3 text-left align-top",
                            "placeholder:text-left placeholder:align-text-top",
                            className,
                        )}
                        {...(props as ComponentProps<typeof Textarea>)}
                        onChange={(e) => {
                            ;(props as ComponentProps<typeof Textarea>).onChange?.(e)
                            onTextChange?.(e.target.value)
                        }}
                    />
                )}
                {isDropdown && (
                    <Dropdown 
                    content={typeList} 
                    value={dropdownValue}
                    onValueChange={(value) => onDropdownChange?.(value)}
                    className={cn(
                        "h-12 rounded-md border-[#D6D6D6] hover:bg-transparent hover:border-primary/70 focus:ring-0",
                        className,
                        )}>
                    </Dropdown>    
                )}
                {isMultiDropdown && (
                    <MultiDropdown
                    content={categoryList}
                    value={multiValue}
                    icon={IconComponent ? <IconComponent color="#949494" className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" /> : undefined}
                    onMultiChange={(value) => onMultiDropdownChange?.(value)}
                    className={cn(
                        "h-12 rounded-md border-[#D6D6D6] hover:bg-transparent hover:border-primary/70",
                        className,
                    )}/>
                )}
                {isDate && (
                    <DatePicker
                    value={dateValue}
                    onChange={(date) => onDateChange?.(date)}
                    />
                )}
                { isTime && (
                    <TimePicker
                    value={dateValue}
                    onChange={(time) => onTimeChange?.(time)}
                    />
                )}
                {!isTextArea && !isDropdown && !isMultiDropdown && !isDate && !isTime && (
                    <Input
                    ref={ref}
                    placeholder={placeholder}
                    type={inputType}
                    className={cn(
                        "relative h-12 text-black border-[#D6D6D6] hover:border-primary/70",
                        "placeholder:text-left placeholder:align-text-top",
                        className,
                    )}
                    {...props}
                    onChange={(e) => {
                        props.onChange?.(e)
                        onTextChange?.(e.target.value)
                    }}
                />)}
            </div>
        </div>
    );
});

FormInput.displayName = "FormInput";

export { FormInput }