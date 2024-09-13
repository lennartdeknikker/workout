<script lang="ts">
    const pdfs = [
        {
            label: "Push",
            href: "/documents/push.pdf"
        },
        {
            label: "Pull",
            href: "/documents/pull.pdf"
        },
        {
            label: "Legs",
            href: "/documents/legs.pdf"
        },
        {
            label: "Abs",
            href: "/documents/abs.pdf"
        },
    ]
</script>

<div class="Page">
	<main>
        <ul>
            {#each pdfs as pdf }
                <li>
                    <a href={pdf.href}>{pdf.label}</a>
                </li>
            {/each}
        </ul>
	</main>
</div>

<style>
	.Page {
		position: relative;
	}
</style>
