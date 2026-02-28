import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const doctor = await prisma.doctor.findFirst({
      include: {
        patients: {
          include: {
            vitals: true,
            healthScores: true
          }
        }
      }
    })
    console.log("Success:", doctor)
  } catch (e) {
    console.error("Error:", e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
