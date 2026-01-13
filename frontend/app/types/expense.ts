export type Expense = {
    id: number
    description: string
    amount: string 
    category: string
    date: string 
  }
  
  export type ExpenseCreate = {
    description: string
    amount: number
    category?: string
    date?: string
  }
  
  export type ExpenseUpdate = Partial<ExpenseCreate>
  