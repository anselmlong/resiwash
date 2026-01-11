import "reflect-metadata";
import { DataSource } from "typeorm";
import { Area } from "./models/Area";
import { Room } from "./models/Room";
import { Machine } from "./models/Machine";
import { UpdateEvent } from "./models/UpdateEvent";
import { RawEvent } from "./models/RawEvent";
import { Sensor } from "./models/Sensor";
import { SensorToMachine } from "./models/SensorToMachine";
import { MachineType, MachineStatus } from "./core/types";
import * as dotenv from "dotenv";

dotenv.config();

// Sample data from the user
const sampleData = {
  areas: [
    {
      name: "Block E",
      location: "Block E Laundry",
      description: "Block E Residential Laundry Room",
      shortName: "Block E",
      rooms: [
        {
          name: "Block E Laundry",
          location: "Ground Floor",
          description: "Main laundry room for Block E",
          machines: [
            // Dryers (6 total)
            { label: "D01", type: MachineType.DRYER, status: MachineStatus.IN_USE, timeSince: "1 hour" },
            { label: "D02", type: MachineType.DRYER, status: MachineStatus.IN_USE, timeSince: "37 minutes" },
            { label: "D03", type: MachineType.DRYER, status: MachineStatus.IN_USE, timeSince: "5 hours" },
            { label: "D04", type: MachineType.DRYER, status: MachineStatus.IN_USE, timeSince: "24 minutes" },
            { label: "D05", type: MachineType.DRYER, status: MachineStatus.IN_USE, timeSince: "1 hour" },
            { label: "D06", type: MachineType.DRYER, status: MachineStatus.IN_USE, timeSince: "37 minutes" },
            // Washers (8 total)
            { label: "W01", type: MachineType.WASHER, status: MachineStatus.AVAILABLE, timeSince: "1 hour" },
            { label: "W02", type: MachineType.WASHER, status: MachineStatus.AVAILABLE, timeSince: "9 minutes" },
            { label: "W03", type: MachineType.WASHER, status: MachineStatus.IN_USE, timeSince: "15 minutes" },
            { label: "W04", type: MachineType.WASHER, status: MachineStatus.AVAILABLE, timeSince: "2 hours" },
            { label: "W05", type: MachineType.WASHER, status: MachineStatus.AVAILABLE, timeSince: "2 hours" },
            { label: "W06", type: MachineType.WASHER, status: MachineStatus.IN_USE, timeSince: "13 minutes" },
            { label: "W07", type: MachineType.WASHER, status: MachineStatus.IN_USE, timeSince: "14 minutes" },
            { label: "W08", type: MachineType.WASHER, status: MachineStatus.AVAILABLE, timeSince: "2 months" },
          ],
        },
      ],
    },
    {
      name: "Tower Block",
      location: "Tower Block Laundry",
      description: "Tower Block Residential Laundry Room",
      shortName: "Tower",
      rooms: [
        {
          name: "Tower Block Laundry",
          location: "Ground Floor",
          description: "Main laundry room for Tower Block",
          machines: [
            // Dryers (6 total)
            { label: "D01", type: MachineType.DRYER, status: MachineStatus.AVAILABLE, timeSince: "2 hours" },
            { label: "D02", type: MachineType.DRYER, status: MachineStatus.AVAILABLE, timeSince: "6 minutes" },
            { label: "D03", type: MachineType.DRYER, status: MachineStatus.AVAILABLE, timeSince: "1 hour" },
            { label: "D04", type: MachineType.DRYER, status: MachineStatus.AVAILABLE, timeSince: "5 hours" },
            { label: "D05", type: MachineType.DRYER, status: MachineStatus.IN_USE, timeSince: "36 minutes" },
            { label: "D06", type: MachineType.DRYER, status: MachineStatus.AVAILABLE, timeSince: "32 minutes" },
            // Washers (8 total)
            { label: "W01", type: MachineType.WASHER, status: MachineStatus.AVAILABLE, timeSince: "1 hour" },
            { label: "W02", type: MachineType.WASHER, status: MachineStatus.AVAILABLE, timeSince: "5 hours" },
            { label: "W3", type: MachineType.WASHER, status: MachineStatus.AVAILABLE, timeSince: "40 minutes" },
            { label: "W4", type: MachineType.WASHER, status: MachineStatus.AVAILABLE, timeSince: "3 hours" },
            { label: "W5", type: MachineType.WASHER, status: MachineStatus.IN_USE, timeSince: "9 minutes" },
            { label: "W6", type: MachineType.WASHER, status: MachineStatus.AVAILABLE, timeSince: "1 minute" },
            { label: "W7", type: MachineType.WASHER, status: MachineStatus.IN_USE, timeSince: "18 minutes" },
            { label: "W8", type: MachineType.WASHER, status: MachineStatus.AVAILABLE, timeSince: "9 hours" },
          ],
        },
      ],
    },
  ],
};

// Helper to parse time strings into Date objects
function parseTimeSince(timeSince: string): Date {
  const now = new Date();
  const match = timeSince.match(/(\d+)\s*(minute|hour|day|month)/i);
  
  if (!match) {
    // Default to 1 minute ago if parsing fails
    return new Date(now.getTime() - 60000);
  }

  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "minute":
      return new Date(now.getTime() - value * 60000);
    case "hour":
      return new Date(now.getTime() - value * 3600000);
    case "day":
      return new Date(now.getTime() - value * 86400000);
    case "month":
      return new Date(now.getTime() - value * 2592000000); // ~30 days
    default:
      return new Date(now.getTime() - 60000);
  }
}

async function seed() {
  const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "resiwash",
    synchronize: false, // Don't auto-create schema
    logging: true,
    entities: [Area, Room, Machine, UpdateEvent, RawEvent, Sensor, SensorToMachine],
  });

  try {
    await AppDataSource.initialize();
    console.log("✓ Database connection established");

    const areaRepo = AppDataSource.getRepository(Area);
    const roomRepo = AppDataSource.getRepository(Room);
    const machineRepo = AppDataSource.getRepository(Machine);
    const eventRepo = AppDataSource.getRepository(UpdateEvent);

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("\n🗑️  Clearing existing data...");
    await eventRepo.delete({});
    await machineRepo.delete({});
    await roomRepo.delete({});
    await areaRepo.delete({});
    console.log("✓ Existing data cleared");

    // Seed data
    console.log("\n🌱 Seeding sample data...");

    for (const areaData of sampleData.areas) {
      // Create Area
      const area = areaRepo.create({
        name: areaData.name,
        location: areaData.location,
        description: areaData.description,
        shortName: areaData.shortName,
      });
      await areaRepo.save(area);
      console.log(`  ✓ Created area: ${area.name}`);

      for (const roomData of areaData.rooms) {
        // Create Room
        const room = roomRepo.create({
          name: roomData.name,
          location: roomData.location,
          description: roomData.description,
          area: area,
        });
        await roomRepo.save(room);
        console.log(`    ✓ Created room: ${room.name}`);

        // Create Machines
        for (const machineData of roomData.machines) {
          const lastChangeTime = parseTimeSince(machineData.timeSince);
          const now = new Date();

          const machine = machineRepo.create({
            name: `${machineData.type} ${machineData.label}`,
            label: machineData.label,
            type: machineData.type,
            room: room,
            roomId: room.roomId,
            currentStatus: machineData.status,
            previousStatus: MachineStatus.UNKNOWN, // Set some default
            lastUpdated: now,
            lastChangeTime: lastChangeTime,
          });
          await machineRepo.save(machine);

          // Create initial event for the current status
          const event = eventRepo.create({
            machine: machine,
            status: machineData.status,
            timestamp: lastChangeTime,
            statusCode: machineData.status === MachineStatus.AVAILABLE ? 0 : 1,
            reading: 0,
          });
          await eventRepo.save(event);

          // Create a more recent update event
          const recentEvent = eventRepo.create({
            machine: machine,
            status: machineData.status,
            timestamp: now,
            statusCode: machineData.status === MachineStatus.AVAILABLE ? 0 : 1,
            reading: 0,
          });
          await eventRepo.save(recentEvent);

          console.log(`      ✓ Created machine: ${machine.label} (${machine.type}) - ${machine.currentStatus}`);
        }
      }
    }

    console.log("\n✅ Sample data seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`  - Areas: ${sampleData.areas.length}`);
    console.log(`  - Rooms: ${sampleData.areas.reduce((sum, a) => sum + a.rooms.length, 0)}`);
    console.log(`  - Machines: ${sampleData.areas.reduce((sum, a) => sum + a.rooms.reduce((s, r) => s + r.machines.length, 0), 0)}`);
    console.log("\nYou can now access the data through the API!");

  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log("\n👋 Seeding complete, exiting...");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
