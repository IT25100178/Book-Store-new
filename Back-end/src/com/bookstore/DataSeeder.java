package com.bookstore;

import com.bookstore.storage.FileStorage;

import java.util.List;

/**
 * DataSeeder – Pre-populates the TXT data files with
 * sample books and a demo admin account if they are empty.
 *
 * This runs once on first server startup.
 */
public class DataSeeder {

    public static void seed() {
        seedAdmin();
        seedBooks();
        seedAuthors();
        seedFAQs();
        seedArticles();
    }

    // ── Admin user ────────────────────────────────────────────────────────────

    private static void seedAdmin() {
        List<String> lines = FileStorage.readLines("users.txt");
        if (!lines.isEmpty()) return;   // already seeded

        // id|name|email|password|phone|address|role|avatar|joinDate
        String admin = "ADMIN001|Yuvaniya Admin|admin@luxurybooks.com|admin123"
                + "|(+94)742624977|132/1 Thalaiyadi Lane Jaffna"
                + "|ADMIN"
                + "|https://ui-avatars.com/api/?background=8B0000&color=fff&name=Admin"
                + "|2024-01-01";
        FileStorage.appendLine("users.txt", admin);
        System.out.println("[Seeder] Admin user created → admin@luxurybooks.com / admin123");
    }

    // ── Books ─────────────────────────────────────────────────────────────────

    private static void seedBooks() {
        List<String> lines = FileStorage.readLines("books.txt");
        if (!lines.isEmpty()) return;   // already seeded

        // id|title|author|price|originalPrice|rating|category|description|
        //   stock|isNew|isBestseller|pages|year|image
        String[] books = {
            "BK001|The Great Gatsby|F. Scott Fitzgerald|14.99|24.99|4.5|Fiction"
                + "|A story of decadence and excess exploring the darker aspects of the American Dream."
                + "|15|false|true|180|1925|📖",

            "BK002|To Kill a Mockingbird|Harper Lee|12.99|19.99|4.8|Classic"
                + "|The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience."
                + "|8|false|true|336|1960|📚",

            "BK003|1984|George Orwell|13.99|18.99|4.7|Dystopian"
                + "|A dystopian social science fiction novel and cautionary tale against unchecked government power."
                + "|20|true|false|328|1949|📕",

            "BK004|Pride and Prejudice|Jane Austen|11.99|16.99|4.6|Romance"
                + "|A romantic novel that also contains a sharp critique of the British class system."
                + "|12|false|true|279|1813|💕",

            "BK005|The Hobbit|J.R.R. Tolkien|15.99|22.99|4.9|Fantasy"
                + "|A fantasy novel about Bilbo Baggins and his unexpected adventure with wizards and dwarves."
                + "|25|false|true|310|1937|🐉",

            "BK006|Harry Potter and the Philosopher's Stone|J.K. Rowling|19.99|29.99|4.9|Fantasy"
                + "|The story of a young wizard and his adventures at Hogwarts School of Witchcraft and Wizardry."
                + "|30|true|true|320|1997|⚡",

            "BK007|The Da Vinci Code|Dan Brown|12.99|17.99|4.3|Mystery"
                + "|A mystery thriller about a murder investigation in the Louvre Museum in Paris."
                + "|18|false|false|454|2003|🔍",

            "BK008|Becoming|Michelle Obama|17.99|24.99|4.8|Biography"
                + "|The intimate and powerful memoir of the former First Lady of the United States."
                + "|22|true|true|448|2018|👩",

            "BK009|Animal Farm|George Orwell|11.99|16.99|4.6|Dystopian"
                + "|A satirical novella about farm animals who rebel against their human farmer."
                + "|18|false|true|112|1945|🐖",

            "BK010|The Lord of the Rings: The Fellowship|J.R.R. Tolkien|18.99|25.99|4.8|Fantasy"
                + "|The first volume following Frodo Baggins and the Fellowship on a quest to destroy the One Ring."
                + "|22|false|true|423|1954|🧙",

            "BK011|The Catcher in the Rye|J.D. Salinger|13.49|18.49|4.4|Classic"
                + "|A controversial novel narrated by Holden Caulfield about teenage rebellion and alienation."
                + "|10|false|false|277|1951|📓",

            "BK012|Sense and Sensibility|Jane Austen|10.99|15.99|4.3|Romance"
                + "|A story of two sisters facing very different challenges in their search for love and happiness."
                + "|14|false|false|352|1811|💃"
        };

        for (String book : books) {
            FileStorage.appendLine("books.txt", book);
        }
        System.out.println("[Seeder] " + books.length + " books seeded into books.txt");
    }

    private static void seedAuthors() {
        List<String> lines = FileStorage.readLines("authors.txt");
        if (!lines.isEmpty()) return;

        // id|name|role|bio|imageUrl|timeline|quote|masterpiece
        String[] authors = {
            "AUT001|F. Scott Fitzgerald|Classic Literature"
                + "|Francis Scott Key Fitzgerald was an American novelist, essayist, and screenwriter. He is best known for his novels depicting the flamboyance and excess of the Jazz Age—a term which he popularized."
                + "|https://images.unsplash.com/photo-1544716278-e513176f20b5?auto=format&fit=crop&q=80&w=400"
                + "|1896 – 1940|“Show me a hero and I'll write you a tragedy.”|The Great Gatsby",

            "AUT002|George Orwell|Political Satire & Dystopian"
                + "|Eric Arthur Blair, known by his pen name George Orwell, was an English novelist, essayist, journalist, and critic. His work is characterized by lucid prose, biting social criticism, and opposition to totalitarianism."
                + "|https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400"
                + "|1903 – 1950|“In a time of deceit telling the truth is a revolutionary act.”|1984 & Animal Farm",

            "AUT003|Jane Austen|Romantic Realism"
                + "|Jane Austen was an English novelist known primarily for her six major novels, which interpret, critique and comment upon the British landed gentry at the end of the 18th century."
                + "|https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400"
                + "|1775 – 1817|“There is no charm equal to tenderness of heart.”|Pride and Prejudice",

            "AUT004|Virginia Woolf|Modernist Literature"
                + "|Virginia Woolf was an English writer, considered one of the most important modernist 20th-century authors and a pioneer in the use of stream of consciousness as a narrative device."
                + "|https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=400"
                + "|1882 – 1941|“No need to hurry. No need to sparkle. No need to be anybody but oneself.”|Mrs Dalloway & To the Lighthouse",

            "AUT005|Ernest Hemingway|Modern Realism"
                + "|Ernest Miller Hemingway was an American novelist, short-story writer, and journalist. His economical and understated style had a strong influence on 20th-century fiction."
                + "|https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400"
                + "|1899 – 1961|“There is no friend as loyal as a book.”|The Old Man and the Sea",

            "AUT006|J.R.R. Tolkien|High Fantasy"
                + "|John Ronald Reuel Tolkien was an English writer, poet, philologist, and academic, best known as the author of the high fantasy works that shaped the modern fantasy genre."
                + "|https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400"
                + "|1892 – 1973|“Not all those who wander are lost.”|The Lord of the Rings"
        };

        for (String author : authors) {
            FileStorage.appendLine("authors.txt", author);
        }
        System.out.println("[Seeder] " + authors.length + " authors seeded into authors.txt");
    }

    private static void seedFAQs() {
        List<String> lines = FileStorage.readLines("faqs.txt");
        if (!lines.isEmpty()) return;

        // id|question|answer|category
        String[] faqs = {
            "FAQ001|How are rare and first edition books authenticated?"
                + "|Every rare and first edition book is authenticated by our in-house team of literary experts and appraisers. We carefully inspect bindings, paper chemistry, ink patterns, and typography. A signed, registered Certificate of Authenticity is provided with every vintage or rare purchase to guarantee its provenance and value."
                + "|CURATION",

            "FAQ002|What packaging do you use for shipping high-value books?"
                + "|We use premium, climate-resistant archival packaging. Books are wrapped in acid-free tissue paper, sealed in moisture-barrier custom archival boxes, and cushioned securely inside heavy-duty outer shipping boxes to ensure they arrive in pristine condition regardless of global transit distance or weather conditions."
                + "|SHIPPING",

            "FAQ003|Do you ship internationally and is it fully insured?"
                + "|Yes, we provide fully insured global shipping via DHL Express or FedEx Priority. Every package is insured for its full purchase value, and requires a signature upon delivery. International delivery typically takes 3-7 business days depending on customs clearance processes."
                + "|SHIPPING",

            "FAQ004|Can I request a rare book that is not in your current catalog?"
                + "|Absolutely. Our specialized Acquisitions Concierge Service specializes in tracking down out-of-print, signed, rare, and historical editions through our global network of collectors and auction houses. Please fill out our contact form or contact our concierge team directly to initiate a search."
                + "|ACQUISITIONS",

            "FAQ005|What is your return policy for rare items?"
                + "|Due to the delicate nature and high value of rare and antiquarian books, returns are handled on a case-by-case basis through our concierge team. Generally, returns are accepted within 14 days of delivery if the book remains in the exact condition in which it was received."
                + "|ACQUISITIONS",

            "FAQ006|How should I store my rare books at home?"
                + "|Rare books should be stored away from direct sunlight in a temperature-controlled room (ideally 65-72°F / 18-22°C) with stable relative humidity (35-50%). Store them upright and tightly enough to support each other without causing friction when sliding them out."
                + "|CURATION"
        };

        for (String faq : faqs) {
            FileStorage.appendLine("faqs.txt", faq);
        }
        System.out.println("[Seeder] " + faqs.length + " FAQs seeded into faqs.txt");
    }

    private static void seedArticles() {
        List<String> lines = FileStorage.readLines("articles.txt");
        if (!lines.isEmpty()) return;

        // id|title|tag|date|readTime|excerpt|imageUrl|content
        String[] articles = {
            "ART001|The Art of Identifying True First Editions|CURATION|October 12, 2024|6 min read"
                + "|Understanding the subtle differences between print runs, dust jacket variations, and publisher markings that signify a true first edition."
                + "|https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=600"
                + "|Identifying a true first edition requires a keen eye and deep bibliographic knowledge. Most collectors search for the elusive number line '1 2 3 4 5 6 7 8 9 10' on the copyright page, but this isn't always definitive. Publishers like Random House signify first editions by including 'First Edition' alongside specific number prints, while others use letters. Furthermore, dust jackets are just as crucial: price clippings, typographic errors, and designer credits can make or break the value of an antiquarian first edition. Always verify the state of a book before completing your acquisitions.",

            "ART002|Preserving Your Personal Library|CONSERVATION|September 28, 2024|8 min read"
                + "|Expert advice on climate control, handling, and shelving techniques to ensure your rare books maintain their condition for generations."
                + "|https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=600"
                + "|Environmental elements are the greatest threat to a library of fine bindings. Paper fibers degrade rapidly when exposed to humidity above 55% or temperature spikes above 75°F. Archival standards dictate that vintage books reside in stable conditions with temperature maintained between 65-72°F and relative humidity between 35-50%. Shelf them upright with uniform sizing, ensuring they are snug enough to prevent warping, but loose enough to prevent friction when sliding them out. Avoid pulling them from the top headcap of the spine, as this breaks the delicate leather bindings.",

            "ART003|The Renaissance of Bookbinding|CRAFTSMANSHIP|September 15, 2024|5 min read"
                + "|A look inside the workshops of modern master bookbinders who are keeping the ancient craft of leather tooling and gilding alive."
                + "|https://images.unsplash.com/photo-1455390582262-044cdead27d8?auto=format&fit=crop&q=80&w=600"
                + "|While digital media flourishes, the ancient craftsmanship of fine leather bookbinding is experiencing a grand renaissance. Masters of the craft continue to use medieval structures, combining hand-sewn flax-linen cords, Moroccan goatskin linings, and exquisite 24k gold leaf tooling. The process is exceptionally laborious, often taking over forty hours for a single volume. Yet, the end result is a tangible piece of structural art that will endure for centuries, preserving the text within a shell of unparalleled beauty and physical strength.",

            "ART004|The Philosophy of Collecting Philosophy|COLLECTING|August 30, 2024|7 min read"
                + "|Why first edition philosophy books from Nietzsche, Kant, and Sartre hold a unique place in the hearts of elite collectors globally."
                + "|https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=600"
                + "|Philosophy collections are not merely lists of titles; they represent chronological intellectual milestones of human progress. Finding a first edition of Immanuel Kant's 'Kritik der reinen Vernunft' (1781) or Friedrich Nietzsche's self-published 'Also sprach Zarathustra' is the pinnacle of intellectual curation. These books were often printed in extremely small numbers due to the revolutionary nature of their ideas, making them highly scarce. To hold a first printing of a text that fundamentally reshaped human consciousness is a profound experience sought by serious bibliophiles.",

            "ART005|A Walk Through Literary History: The Lost Manuscripts|HISTORY|August 10, 2024|10 min read"
                + "|Exploring historical documents that were lost to time, only to be rediscovered in the most unexpected attics and monastery vaults."
                + "|https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&q=80&w=600"
                + "|Literary history is replete with legendary lost texts. The second book of Aristotle's 'Poetics' on comedy, the original manuscripts of early Renaissance poets, and lost draft versions of canonical classics continue to fire the imaginations of researchers. Over the past decade, incredible discoveries have occurred: early drafts of Charlotte Brontë's letters discovered behind fireplace brickwork, and centuries-old scrolls identified within micro-CT scans of carbonized Herculaneum papyri. Every locked chest and untouched archives trunk represents a potential portal to a lost masterpiece.",

            "ART006|Curating a Modern Library: Classics Meets Contemporary|LIFESTYLE|July 24, 2024|6 min read"
                + "|A comprehensive guide on balancing timeless 19th-century antiquarian leather-bound volumes with striking 21st-century modern classics."
                + "|https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600"
                + "|A truly premium library should be a direct reflection of its owner's eclectic intellectual taste rather than a museum of uniform bindings. Modern library curation blends classic 19th-century leather-bound volumes with the bold graphic designs of contemporary first-edition novels. Contrast deep brown calfskin spines with vibrant, minimalistic modern dust jackets. Using glass-fronted modern cabinets alongside dark walnut shelves creates a striking aesthetic harmony that captures the continuity of human thought across centuries."
        };

        for (String art : articles) {
            FileStorage.appendLine("articles.txt", art);
        }
        System.out.println("[Seeder] " + articles.length + " articles seeded into articles.txt");
    }
}
